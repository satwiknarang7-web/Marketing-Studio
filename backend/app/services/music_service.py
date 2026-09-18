"""Lay a music bed under a video.

The bed is looped or trimmed to the clip's length, faded in and out, and — when
the clip already carries narration — ducked beneath it with a sidechain
compressor, so the music drops while someone is speaking and comes back up
between lines. Mixing at a flat volume under a voiceover is what makes a video
sound amateur, so ducking is the default rather than an option.
"""

import asyncio
import logging
import os
import re
import subprocess
import uuid

logger = logging.getLogger(__name__)

VIDEO_DIR = os.path.join("data", "videos")
MUSIC_DIR = os.path.join("data", "music")
AUDIO_RATE = 44100

_SAFE_NAME = re.compile(r"^[A-Za-z0-9._-]+$")

# Sensible defaults for a spoken-word marketing video.
DEFAULT_MUSIC_GAIN = 0.18  # bed level when there is narration over it
DEFAULT_SOLO_GAIN = 0.55   # bed level when the clip is silent
FADE_IN = 1.0
FADE_OUT = 2.0


def _ffmpeg() -> str:
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


def _resolve(url: str, subdir: str, kind: str) -> str:
    prefix = f"/data/{subdir}/"
    if not url.startswith(prefix):
        raise ValueError(f"Not a {kind} URL: {url}")
    name = url[len(prefix):]
    if not _SAFE_NAME.match(name):
        raise ValueError(f"Unexpected {kind} filename: {name}")
    base = os.path.abspath(os.path.join("data", subdir))
    path = os.path.abspath(os.path.join(base, name))
    if os.path.commonpath([base, path]) != base:
        raise ValueError(f"Refusing to read outside the {kind} directory.")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Could not find the {kind}: {name}")
    return path


def _build_graph(video_has_audio: bool, duration: float, gain: float, duck: bool) -> tuple[str, str]:
    """Filter graph putting the music bed under the clip's own audio."""
    fade_out_start = max(0.0, duration - FADE_OUT)

    # Input 1 is the music, looped by -stream_loop and trimmed to the clip.
    bed = (
        f"[1:a]atrim=duration={duration:.3f},asetpts=PTS-STARTPTS,"
        f"aformat=sample_rates={AUDIO_RATE}:channel_layouts=stereo,"
        f"volume={gain:.3f},"
        f"afade=t=in:st=0:d={FADE_IN},"
        f"afade=t=out:st={fade_out_start:.3f}:d={FADE_OUT}[bed]"
    )

    if not video_has_audio:
        return bed, "[bed]"

    voice = (
        f"[0:a]aformat=sample_rates={AUDIO_RATE}:channel_layouts=stereo,"
        f"asetpts=PTS-STARTPTS[voice]"
    )

    if duck:
        # Split the voice: one copy is mixed in, the other drives the compressor.
        parts = [
            voice,
            "[voice]asplit=2[voice_mix][voice_key]",
            bed,
            # Music is compressed whenever the key signal (speech) is present.
            # Tuned by measuring the bed in isolation against a gapped voice
            # track: these values give ~11dB of duck, where threshold=0.03
            # ratio=8 gave an inaudible 7.7dB and threshold=0.005 ratio=20
            # buried the music entirely at 23dB.
            "[bed][voice_key]sidechaincompress="
            "threshold=0.02:ratio=10:attack=15:release=350:makeup=1[ducked]",
            "[voice_mix][ducked]amix=inputs=2:duration=first:dropout_transition=0[outa]",
        ]
        return ";".join(parts), "[outa]"

    parts = [
        voice,
        bed,
        "[voice][bed]amix=inputs=2:duration=first:dropout_transition=0[outa]",
    ]
    return ";".join(parts), "[outa]"


def _run_mix(video_path: str, music_path: str, out_path: str,
             duration: float, video_has_audio: bool, gain: float, duck: bool) -> None:
    graph, out_label = _build_graph(video_has_audio, duration, gain, duck)

    cmd = [_ffmpeg(), "-y", "-i", video_path]
    # Loop the bed so a short track still covers a long clip.
    cmd += ["-stream_loop", "-1", "-i", music_path]
    cmd += [
        "-filter_complex", graph,
        "-map", "0:v:0",
        "-map", out_label,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", f"{duration:.3f}",
        "-movflags", "+faststart",
        out_path,
    ]

    res = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
    if res.returncode != 0 or not os.path.exists(out_path):
        logger.error(f"ffmpeg music mix failed: {res.stderr[-1500:]}")
        raise RuntimeError(f"Could not add the music: {res.stderr.strip()[-400:]}")


async def add_music_bed(
    video_url: str,
    music_url: str,
    gain: float | None = None,
    duck: bool = True,
) -> dict:
    """Mix a looping, fading music bed under a clip. Returns the new clip."""
    from app.services.video_edit_service import probe

    video_path = _resolve(video_url, "videos", "video")
    music_path = _resolve(music_url, "music", "music")

    info = await asyncio.to_thread(probe, video_path)
    duration = info["duration"]
    if not duration:
        raise ValueError("Could not read the clip's duration.")
    has_audio = info["has_audio"]

    if gain is None:
        gain = DEFAULT_MUSIC_GAIN if has_audio else DEFAULT_SOLO_GAIN
    gain = max(0.0, min(float(gain), 1.5))

    filename = f"{uuid.uuid4()}.mp4"
    out_path = os.path.join(VIDEO_DIR, filename)
    os.makedirs(VIDEO_DIR, exist_ok=True)

    await asyncio.to_thread(
        _run_mix, video_path, music_path, out_path, duration, has_audio, gain, duck
    )

    out_info = await asyncio.to_thread(probe, out_path)
    return {
        "video_url": f"/data/videos/{filename}",
        "duration_seconds": out_info["duration"],
        "music_gain": round(gain, 3),
        "ducked": bool(duck and has_audio),
        "had_narration": has_audio,
    }
