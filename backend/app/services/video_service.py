import asyncio
import uuid
import os
import shutil
import logging
import base64
from app.config import settings

logger = logging.getLogger(__name__)

STYLE_PREFIXES = {
    "cartoon": "colorful 3D animated cartoon style, cheerful and friendly character, bright studio lighting, smooth whimsical motion",
    "animation": "vibrant 3D animation, stylized aesthetics, joyful movement, high quality animated film",
    "cinematic": "cinematic film style, rich natural lighting, high definition, smooth camera motion",
    "product_showcase": "commercial product showcase, clean white studio lighting, smooth 3D rotation, elegant presentation",
    "social_media": "vibrant, eye-catching social media clip, energetic motion, clean aesthetic",
    "corporate": "professional corporate presentation, clean modern aesthetic, high definition",
    "dynamic": "dynamic action, smooth energetic camera movement, clean focus",
    "natural": "",
}

NEGATIVE_PROMPT = (
    "ugly, monster, creepy, alien, realistic human flesh, deformed creature, "
    "dark room spotlight, horror, grotesque, blurry, jittery, distorted, low resolution"
)


def _clean_and_enrich_prompt(prompt: str, style: str) -> str:
    """Enriches short or ambiguous prompts to ensure the actual subject is depicted accurately."""
    p_lower = prompt.lower()

    # Detect if user is asking for cartoon or animation
    is_cartoon = any(w in p_lower for w in ["cartoon", "anime", "animated", "toon", "disney", "pixar"])

    # Enhance specific short prompts like "banana cartoon"
    if "banana" in p_lower:
        if is_cartoon:
            prompt = prompt.replace("banana cartoon", "a cheerful yellow curved banana fruit with a cute cartoon face, smiling and dancing")
            if "cartoon" not in style:
                style = "cartoon"
        else:
            prompt = f"a fresh bright yellow banana fruit, {prompt}"

    style_prefix = STYLE_PREFIXES.get(style, STYLE_PREFIXES.get("cartoon" if is_cartoon else "cinematic", ""))
    if style_prefix and style_prefix.lower() not in prompt.lower():
        full_prompt = f"{style_prefix}, {prompt}"
    else:
        full_prompt = prompt

    return full_prompt


def _call_ltx_video(full_prompt: str, duration: int, input_image_path: str | None = None) -> str | None:
    """Call the real Lightricks LTX-Video model via Hugging Face Space."""
    from gradio_client import Client, handle_file

    client = Client(
        "Lightricks/ltx-video-distilled",
        token=settings.HF_TOKEN if settings.HF_TOKEN else None,
    )

    if input_image_path and os.path.exists(input_image_path):
        # Image-to-Video mode
        res = client.predict(
            prompt=full_prompt,
            negative_prompt=NEGATIVE_PROMPT,
            input_image_filepath=handle_file(input_image_path),
            input_video_filepath=None,
            height_ui=480,
            width_ui=640,
            mode="image-to-video",
            duration_ui=max(2, min(duration, 5)),
            ui_frames_to_use=9,
            seed_ui=42,
            randomize_seed=True,
            ui_guidance_scale=1.0,
            improve_texture_flag=True,
            api_name="/image_to_video",
        )
    else:
        # Text-to-Video mode
        res = client.predict(
            prompt=full_prompt,
            negative_prompt=NEGATIVE_PROMPT,
            input_image_filepath=None,
            input_video_filepath=None,
            height_ui=480,
            width_ui=640,
            mode="text-to-video",
            duration_ui=max(2, min(duration, 5)),
            ui_frames_to_use=9,
            seed_ui=42,
            randomize_seed=True,
            ui_guidance_scale=1.0,
            improve_texture_flag=True,
            api_name="/text_to_video",
        )

    if isinstance(res, (tuple, list)) and len(res) > 0:
        video_info = res[0]
        if isinstance(video_info, dict) and "video" in video_info:
            return video_info["video"]
    return None


def _synthesize_camera_motion_video(
    image_path: str,
    output_path: str,
    camera_movement: str,
    duration_seconds: int = 4,
    fps: int = 24,
) -> str:
    """Synthesizes high-definition cinematic camera motion from an image using imageio-ffmpeg."""
    import math
    import imageio_ffmpeg
    from PIL import Image

    width, height = 848, 480  # 16:9 Cinema widescreen (divisible by 16)
    total_frames = max(24, duration_seconds * fps)

    with Image.open(image_path) as raw_img:
        base_img = raw_img.convert("RGB")

    # Expand canvas by 35% margin for smooth camera pans and zooms without edge clipping
    margin = 1.35
    work_w = int(width * margin)
    work_h = int(height * margin)
    base = base_img.resize((work_w, work_h), Image.Resampling.LANCZOS)

    writer = imageio_ffmpeg.write_frames(
        output_path,
        (width, height),
        fps=fps,
        codec="libx264",
        pix_fmt_in="rgb24",
        macro_block_size=16,
    )
    writer.send(None)  # prime generator

    mov = camera_movement.lower()

    for i in range(total_frames):
        t = i / float(total_frames)
        # Cosine ease-in-out curve for cinematic fluidity
        ease = 0.5 - 0.5 * math.cos(math.pi * t)

        if "zoom_out" in mov or "pull" in mov:
            scale = 1.30 - 0.28 * ease
            crop_w = int(work_w / scale)
            crop_h = int(work_h / scale)
            left = (work_w - crop_w) // 2
            top = (work_h - crop_h) // 2
        elif "pan_left" in mov:
            crop_w = width
            crop_h = height
            max_off = work_w - crop_w
            left = int(max_off * (1.0 - ease))
            top = (work_h - crop_h) // 2
        elif "pan_right" in mov:
            crop_w = width
            crop_h = height
            max_off = work_w - crop_w
            left = int(max_off * ease)
            top = (work_h - crop_h) // 2
        elif "tilt_up" in mov:
            crop_w = width
            crop_h = height
            max_off = work_h - crop_h
            left = (work_w - crop_w) // 2
            top = int(max_off * (1.0 - ease))
        elif "tilt_down" in mov:
            crop_w = width
            crop_h = height
            max_off = work_h - crop_h
            left = (work_w - crop_w) // 2
            top = int(max_off * ease)
        elif "orbit" in mov or "drone" in mov or "fpv" in mov:
            angle = ease * 2 * math.pi * 0.35
            scale = 1.12 + 0.14 * math.sin(ease * math.pi)
            crop_w = int(work_w / scale)
            crop_h = int(work_h / scale)
            dx = int((work_w - crop_w) * (0.5 + 0.32 * math.cos(angle)))
            dy = int((work_h - crop_h) * (0.5 + 0.28 * math.sin(angle)))
            left = max(0, min(work_w - crop_w, dx))
            top = max(0, min(work_h - crop_h, dy))
        elif "static" in mov or "tripod" in mov:
            # Subtle natural cinematic breathing
            scale = 1.04 + 0.03 * math.sin(ease * math.pi * 2)
            crop_w = int(work_w / scale)
            crop_h = int(work_h / scale)
            left = (work_w - crop_w) // 2
            top = (work_h - crop_h) // 2
        else:
            # Default: Dynamic Zoom In (Push)
            scale = 1.02 + 0.28 * ease
            crop_w = int(work_w / scale)
            crop_h = int(work_h / scale)
            left = (work_w - crop_w) // 2
            top = (work_h - crop_h) // 2

        frame = base.crop((left, top, left + crop_w, top + crop_h)).resize(
            (width, height), Image.Resampling.BILINEAR
        )
        writer.send(frame.tobytes())

    writer.close()
    return output_path


async def generate_video(
    prompt: str,
    duration_seconds: int,
    style: str,
    image_data: str | None = None,
) -> str:
    """Generate a real AI video clip using LTX-Video with automatic Free Motion Synthesizer fallback."""
    full_prompt = _clean_and_enrich_prompt(prompt, style.lower().replace(" ", "_"))

    filename = f"{uuid.uuid4()}.mp4"
    filepath = os.path.join("data", "videos", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    input_img_path = None
    if image_data:
        # If user passed base64 image data for image-to-video
        try:
            if "," in image_data:
                image_data = image_data.split(",", 1)[1]
            raw_bytes = base64.b64decode(image_data)
            input_img_path = os.path.join("data", "images", f"temp_{uuid.uuid4()}.png")
            with open(input_img_path, "wb") as f:
                f.write(raw_bytes)
        except Exception as e:
            logger.warning(f"Could not decode input image: {e}")

    # Step 1: Try Hugging Face LTX-Video Space
    try:
        temp_video_path = await asyncio.to_thread(
            _call_ltx_video, full_prompt, duration_seconds, input_img_path
        )
        if temp_video_path and os.path.exists(temp_video_path):
            shutil.copyfile(temp_video_path, filepath)
            return f"/data/videos/{filename}"
    except Exception as e:
        logger.warning(
            f"LTX-Video Hugging Face Space failed ({e}). "
            "Engaging 100% Free Camera Motion Synthesizer..."
        )

    # Step 2: Resilient Free Motion Fallback (ZeroGPU Quota Safe)
    try:
        # If no input image, generate scene frame using FLUX.1-schnell
        if not input_img_path or not os.path.exists(input_img_path):
            from app.services.image_service import generate_image
            _, input_img_path = await generate_image(
                prompt=full_prompt,
                negative_prompt=NEGATIVE_PROMPT,
                width=1024,
                height=576,
                style=style if style else "photorealistic",
            )

        # Synthesize camera motion from the keyframe
        await asyncio.to_thread(
            _synthesize_camera_motion_video,
            input_img_path,
            filepath,
            prompt,
            max(2, min(duration_seconds, 6)),
            24,
        )

        if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
            return f"/data/videos/{filename}"

    except Exception as fallback_err:
        logger.error(f"Fallback motion engine failed: {fallback_err}")
        raise RuntimeError(f"Video generation error: {str(fallback_err)}")

    finally:
        if input_img_path and os.path.exists(input_img_path) and "temp_" in input_img_path:
            try:
                os.remove(input_img_path)
            except Exception:
                pass

    raise RuntimeError("Could not generate video clip. Please try a different prompt.")
