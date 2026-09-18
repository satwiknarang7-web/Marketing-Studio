"""Voiceover generation and audio/video muxing.

Speech is synthesised with edge-tts, which uses Microsoft Edge's Read Aloud
service: free, no API key, no GPU and no per-user quota, which is why it is the
default rather than a Hugging Face Space. Note it is an undocumented endpoint,
so it is a dependency worth knowing about. For a fully self-hosted alternative
see the note in README under "Voiceover".
"""

import asyncio
import logging
import os
import re
import subprocess
import uuid

logger = logging.getLogger(__name__)

AUDIO_DIR = os.path.join("data", "audio")

# Curated delivery presets. `voice` is an edge-tts ShortName; the full catalogue
# is exposed separately so the team is not limited to these.
VOICE_PRESETS = [
    {
        "id": "brand_friendly",
        "name": "Friendly Brand Voice",
        "voice": "en-US-AvaNeural",
        "tone": "Warm, conversational — general marketing and explainers",
        "rate": "+0%",
        "pitch": "+0Hz",
    },
    {
        "id": "narrator_deep",
        "name": "Deep Documentary Narrator",
        "voice": "en-US-AndrewNeural",
        "tone": "Low, measured — brand films and corporate video",
        "rate": "-8%",
        "pitch": "-2Hz",
    },
    {
        "id": "ad_energetic",
        "name": "High-Energy Ad Read",
        "voice": "en-US-BrianNeural",
        "tone": "Punchy, upbeat — DTC and performance ads",
        "rate": "+12%",
        "pitch": "+3Hz",
    },
    {
        "id": "calm_luxury",
        "name": "Calm & Premium",
        "voice": "en-US-EmmaNeural",
        "tone": "Soft, unhurried — beauty, skincare and luxury",
        "rate": "-6%",
        "pitch": "+0Hz",
    },
    {
        "id": "uk_professional",
        "name": "British Professional",
        "voice": "en-GB-SoniaNeural",
        "tone": "Crisp RP English — B2B and LinkedIn",
        "rate": "+0%",
        "pitch": "+0Hz",
    },
    {
        "id": "au_casual",
        "name": "Australian Casual",
        "voice": "en-AU-NatashaNeural",
        "tone": "Relaxed, friendly — UGC and social",
        "rate": "+0%",
        "pitch": "+0Hz",
    },
]

PRESETS_BY_ID = {p["id"]: p for p in VOICE_PRESETS}


def _ffmpeg() -> str:
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


_DURATION_RE = re.compile(r"Duration:\s*(\d+):(\d+):(\d+\.?\d*)")


def _probe_duration(path: str) -> float | None:
    """Read a media file's duration. Uses ffmpeg itself; ffprobe is not bundled."""
    try:
        res = subprocess.run(
            [_ffmpeg(), "-i", path],
            capture_output=True,
            text=True,
            timeout=30,
        )
        # ffmpeg writes stream info to stderr and exits non-zero with no output file.
        m = _DURATION_RE.search(res.stderr)
        if m:
            h, mnt, sec = m.groups()
            return int(h) * 3600 + int(mnt) * 60 + float(sec)
    except Exception as e:
        logger.warning(f"Could not probe duration for {path}: {e}")
    return None


async def list_voices(locale_prefix: str = "en-") -> list[dict]:
    """Full catalogue of available voices, filtered by locale prefix."""
    import edge_tts

    voices = await edge_tts.list_voices()
    out = []
    for v in voices:
        if locale_prefix and not v.get("Locale", "").startswith(locale_prefix):
            continue
        tag = v.get("VoiceTag") or {}
        out.append(
            {
                "voice": v.get("ShortName"),
                "locale": v.get("Locale"),
                "gender": v.get("Gender"),
                "personalities": tag.get("VoicePersonalities") or [],
            }
        )
    out.sort(key=lambda x: (x["locale"] or "", x["voice"] or ""))
    return out


async def synthesize_speech(
    script: str,
    preset_id: str = "brand_friendly",
    voice: str | None = None,
    rate: str | None = None,
    pitch: str | None = None,
) -> tuple[str, float | None, str]:
    """Render a script to an mp3. Returns (public_url, duration_seconds, voice_used)."""
    import edge_tts

    script = (script or "").strip()
    if not script:
        raise ValueError("Script is empty.")

    preset = PRESETS_BY_ID.get(preset_id, PRESETS_BY_ID["brand_friendly"])
    chosen_voice = voice or preset["voice"]
    chosen_rate = rate or preset["rate"]
    chosen_pitch = pitch or preset["pitch"]

    os.makedirs(AUDIO_DIR, exist_ok=True)
    filename = f"{uuid.uuid4()}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    # The upstream service intermittently returns an empty stream, so retry
    # rather than surfacing a spurious failure to the user.
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            communicate = edge_tts.Communicate(
                script, chosen_voice, rate=chosen_rate, pitch=chosen_pitch
            )
            await communicate.save(filepath)
            if os.path.exists(filepath) and os.path.getsize(filepath) >= 512:
                break
            last_error = RuntimeError("Voice synthesis returned an empty stream.")
        except Exception as e:  # noqa: BLE001 - retried below, re-raised if final
            last_error = e
            logger.warning(f"TTS attempt {attempt + 1}/3 failed: {e}")

        if attempt < 2:
            await asyncio.sleep(1.5 * (attempt + 1))
    else:
        raise RuntimeError(f"Voice synthesis failed after 3 attempts: {last_error}")

    duration = await asyncio.to_thread(_probe_duration, filepath)
    return f"/data/audio/{filename}", duration, chosen_voice


def _mux(video_path: str, audio_path: str, out_path: str, fit: str) -> None:
    """Mux an audio track onto a video.

    fit="pad"      hold the last video frame so the whole script is heard
    fit="truncate" cut at whichever track ends first
    """
    ffmpeg = _ffmpeg()
    v_dur = _probe_duration(video_path)
    a_dur = _probe_duration(audio_path)

    cmd = [ffmpeg, "-y", "-i", video_path, "-i", audio_path]

    if fit == "truncate":
        cmd += ["-c:v", "copy", "-shortest"]
    elif v_dur and a_dur and a_dur > v_dur:
        # Voiceover outruns the clip: freeze the final frame for the remainder
        # so the whole script is heard.
        cmd += [
            "-vf",
            f"tpad=stop_mode=clone:stop_duration={a_dur - v_dur:.2f}",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
        ]
    else:
        # Clip outruns the voiceover: keep every video frame and let the audio
        # finish early. No -shortest here, or the video would be cut to the
        # length of the voiceover.
        cmd += ["-c:v", "copy"]

    cmd += ["-c:a", "aac", "-b:a", "192k", "-map", "0:v:0", "-map", "1:a:0", out_path]

    res = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if res.returncode != 0 or not os.path.exists(out_path):
        raise RuntimeError(f"ffmpeg mux failed: {res.stderr[-600:]}")


_SAFE_NAME = re.compile(r"^[A-Za-z0-9._-]+$")


def _resolve_media(url: str, subdir: str, kind: str) -> str:
    """Map a /data/<subdir>/<file> URL to a path, refusing anything outside it.

    The URL arrives from the client, so the filename is validated rather than
    trusted and the resolved path is checked to still sit inside the directory.
    """
    prefix = f"/data/{subdir}/"
    if not url.startswith(prefix):
        raise ValueError(f"Not a generated {kind} URL: {url}")

    name = url[len(prefix):]
    if not _SAFE_NAME.match(name):
        raise ValueError(f"Unexpected {kind} filename: {name}")

    base = os.path.abspath(os.path.join("data", subdir))
    path = os.path.abspath(os.path.join(base, name))
    if os.path.commonpath([base, path]) != base:
        raise ValueError(f"Refusing to read outside the {kind} directory.")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Could not find the {kind} file: {name}")
    return path


async def attach_voiceover(
    video_url: str,
    audio_url: str,
    fit: str = "pad",
) -> str:
    """Attach a generated voiceover to a generated video. Returns the new URL."""
    video_path = _resolve_media(video_url, "videos", "video")
    audio_path = _resolve_media(audio_url, "audio", "audio")

    filename = f"{uuid.uuid4()}.mp4"
    out_path = os.path.join("data", "videos", filename)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    await asyncio.to_thread(_mux, video_path, audio_path, out_path, fit)
    return f"/data/videos/{filename}"
