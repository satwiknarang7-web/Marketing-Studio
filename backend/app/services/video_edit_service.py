"""Join generated clips into one longer video.

Clips from this studio are not uniform: LTX output, the keyframe-motion
fallback and voiced clips differ in resolution, frame rate and whether they
carry an audio track at all. The concat demuxer requires identical streams, so
everything is normalised through a filter graph first — scaled and padded to a
common canvas, resampled to a common frame rate, and given silent audio where a
clip has none so no other clip's audio is dropped.
"""

import asyncio
import logging
import os
import re
import subprocess
import uuid

logger = logging.getLogger(__name__)

VIDEO_DIR = os.path.join("data", "videos")

MAX_CLIPS = 20
MAX_FPS = 30
DEFAULT_FPS = 24
AUDIO_RATE = 44100

_SAFE_NAME = re.compile(r"^[A-Za-z0-9._-]+$")
_DURATION_RE = re.compile(r"Duration:\s*(\d+):(\d+):(\d+\.?\d*)")
_VIDEO_RE = re.compile(r"Video:\s.*?,\s*(\d+)x(\d+)")
_FPS_RE = re.compile(r"([\d.]+)\s*fps")


def _ffmpeg() -> str:
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


class ClipInfo:
    __slots__ = ("path", "url", "duration", "width", "height", "fps", "has_audio")

    def __init__(self, path: str, url: str, duration: float, width: int, height: int,
                 fps: float, has_audio: bool):
        self.path = path
        self.url = url
        self.duration = duration
        self.width = width
        self.height = height
        self.fps = fps
        self.has_audio = has_audio


def probe(path: str) -> dict:
    """Read a clip's shape. Uses ffmpeg itself; ffprobe is not bundled."""
    res = subprocess.run([_ffmpeg(), "-i", path], capture_output=True, text=True, timeout=60)
    err = res.stderr

    duration = None
    m = _DURATION_RE.search(err)
    if m:
        h, mnt, sec = m.groups()
        duration = int(h) * 3600 + int(mnt) * 60 + float(sec)

    width = height = None
    m = _VIDEO_RE.search(err)
    if m:
        width, height = int(m.group(1)), int(m.group(2))

    fps = None
    m = _FPS_RE.search(err)
    if m:
        try:
            fps = float(m.group(1))
        except ValueError:
            fps = None

    return {
        "duration": duration,
        "width": width,
        "height": height,
        "fps": fps,
        "has_audio": "Audio:" in err,
    }


def resolve_clip(url: str) -> str:
    """Map a /data/videos/<file> URL to a path, refusing anything else."""
    prefix = "/data/videos/"
    if not url.startswith(prefix):
        raise ValueError(f"Not a generated video URL: {url}")
    name = url[len(prefix):]
    if not _SAFE_NAME.match(name):
        raise ValueError(f"Unexpected video filename: {name}")

    base = os.path.abspath(VIDEO_DIR)
    path = os.path.abspath(os.path.join(base, name))
    if os.path.commonpath([base, path]) != base:
        raise ValueError("Refusing to read outside the video directory.")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Could not find the clip: {name}")
    return path


def _gather(urls: list[str]) -> list[ClipInfo]:
    clips: list[ClipInfo] = []
    for url in urls:
        path = resolve_clip(url)
        info = probe(path)
        if not info["duration"] or not info["width"] or not info["height"]:
            raise ValueError(f"Could not read the clip {os.path.basename(path)}.")
        clips.append(
            ClipInfo(path, url, info["duration"], info["width"], info["height"],
                     info["fps"] or DEFAULT_FPS, info["has_audio"])
        )
    return clips


def _target_canvas(clips: list[ClipInfo]) -> tuple[int, int, int]:
    """Largest frame among the clips, with even dimensions for H.264."""
    width = max(c.width for c in clips)
    height = max(c.height for c in clips)
    width += width % 2
    height += height % 2
    fps = min(MAX_FPS, max(int(round(c.fps)) for c in clips)) or DEFAULT_FPS
    return width, height, fps


def _normalise_video(index: int, width: int, height: int, fps: int, label: str) -> str:
    """Scale to fit, pad to the canvas, square pixels, fixed frame rate."""
    return (
        f"[{index}:v]scale={width}:{height}:force_original_aspect_ratio=decrease,"
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=black,"
        f"setsar=1,fps={fps},format=yuv420p[{label}]"
    )


def _normalise_audio(clip: ClipInfo, index: int, label: str) -> str:
    if clip.has_audio:
        return f"[{index}:a]aformat=sample_rates={AUDIO_RATE}:channel_layouts=stereo,asetpts=PTS-STARTPTS[{label}]"
    # Silence, so a clip without audio does not cause every other clip's audio
    # to be discarded by concat.
    return (
        f"anullsrc=channel_layout=stereo:sample_rate={AUDIO_RATE},"
        f"atrim=duration={clip.duration:.3f},asetpts=PTS-STARTPTS[{label}]"
    )


def _build_cut_graph(clips: list[ClipInfo], width: int, height: int, fps: int,
                     want_audio: bool) -> tuple[str, str, str | None]:
    parts = []
    for i, c in enumerate(clips):
        parts.append(_normalise_video(i, width, height, fps, f"v{i}"))
        if want_audio:
            parts.append(_normalise_audio(c, i, f"a{i}"))

    if want_audio:
        streams = "".join(f"[v{i}][a{i}]" for i in range(len(clips)))
        parts.append(f"{streams}concat=n={len(clips)}:v=1:a=1[outv][outa]")
        return ";".join(parts), "[outv]", "[outa]"

    streams = "".join(f"[v{i}]" for i in range(len(clips)))
    parts.append(f"{streams}concat=n={len(clips)}:v=1:a=0[outv]")
    return ";".join(parts), "[outv]", None


def _build_crossfade_graph(clips: list[ClipInfo], width: int, height: int, fps: int,
                           want_audio: bool, fade: float) -> tuple[str, str, str | None]:
    """Chain xfade across the clips, accumulating offsets.

    Each transition overlaps the pair by `fade`, so clip k starts at
    sum(durations before it) minus the fades already consumed.
    """
    parts = []
    for i, c in enumerate(clips):
        parts.append(_normalise_video(i, width, height, fps, f"v{i}"))
        if want_audio:
            parts.append(_normalise_audio(c, i, f"a{i}"))

    current_v = "v0"
    elapsed = clips[0].duration
    for i in range(1, len(clips)):
        offset = max(0.0, elapsed - fade)
        out = f"xv{i}"
        parts.append(
            f"[{current_v}][v{i}]xfade=transition=fade:duration={fade:.3f}:"
            f"offset={offset:.3f}[{out}]"
        )
        current_v = out
        # The xfade output runs to its offset plus the incoming clip.
        elapsed = offset + clips[i].duration

    if want_audio:
        current_a = "a0"
        for i in range(1, len(clips)):
            out = f"xa{i}"
            parts.append(f"[{current_a}][a{i}]acrossfade=d={fade:.3f}[{out}]")
            current_a = out
        return ";".join(parts), f"[{current_v}]", f"[{current_a}]"

    return ";".join(parts), f"[{current_v}]", None


def _run_stitch(clips: list[ClipInfo], out_path: str, transition: str, fade: float) -> None:
    width, height, fps = _target_canvas(clips)
    want_audio = any(c.has_audio for c in clips)

    if transition == "crossfade" and len(clips) > 1:
        # A fade cannot be longer than the clips it joins.
        shortest = min(c.duration for c in clips)
        fade = max(0.1, min(fade, shortest / 2))
        graph, v_out, a_out = _build_crossfade_graph(clips, width, height, fps, want_audio, fade)
    else:
        graph, v_out, a_out = _build_cut_graph(clips, width, height, fps, want_audio)

    cmd = [_ffmpeg(), "-y"]
    for c in clips:
        cmd += ["-i", c.path]
    cmd += ["-filter_complex", graph, "-map", v_out]
    if a_out:
        cmd += ["-map", a_out, "-c:a", "aac", "-b:a", "192k"]
    cmd += [
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        out_path,
    ]

    res = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
    if res.returncode != 0 or not os.path.exists(out_path):
        logger.error(f"ffmpeg stitch failed: {res.stderr[-1500:]}")
        raise RuntimeError(f"Could not join the clips: {res.stderr.strip()[-400:]}")


async def stitch_clips(
    video_urls: list[str],
    transition: str = "cut",
    transition_duration: float = 0.5,
) -> dict:
    """Join clips in order. Returns the new clip's url, duration and shape."""
    if len(video_urls) < 2:
        raise ValueError("Pick at least two clips to join.")
    if len(video_urls) > MAX_CLIPS:
        raise ValueError(f"That is more than {MAX_CLIPS} clips.")
    if transition not in ("cut", "crossfade"):
        raise ValueError("Transition must be 'cut' or 'crossfade'.")

    clips = await asyncio.to_thread(_gather, video_urls)

    filename = f"{uuid.uuid4()}.mp4"
    out_path = os.path.join(VIDEO_DIR, filename)
    os.makedirs(VIDEO_DIR, exist_ok=True)

    await asyncio.to_thread(_run_stitch, clips, out_path, transition, transition_duration)

    info = await asyncio.to_thread(probe, out_path)
    return {
        "video_url": f"/data/videos/{filename}",
        "duration_seconds": info["duration"],
        "width": info["width"],
        "height": info["height"],
        "clip_count": len(clips),
        "has_audio": info["has_audio"],
        "source_duration": round(sum(c.duration for c in clips), 2),
    }
