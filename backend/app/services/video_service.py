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


CAMERA_MOVEMENTS = {
    "static", "pan_left", "pan_right", "tilt_up", "tilt_down",
    "zoom_in", "zoom_out", "orbit_360", "crane_up", "fpv_drone",
}

# Cinema Studio camera stacks mapped onto the motion paths we can actually render.
CAMERA_ALIASES = {
    "dolly_zoom": "zoom_in",
    "whip_pan": "pan_right",
    "crane_tilt": "crane_up",
    "tracking_orbit": "orbit_360",
    "fpv_dive": "fpv_drone",
    "camera_reframe": "orbit_360",
}


def _resolve_camera_movement(camera_movement: str | None) -> str:
    """Normalise a UI camera id to one of CAMERA_MOVEMENTS.

    Accepts ids ("pan_left"), labels ("Pan Left") and Cinema stack ids
    ("tracking_orbit"). Unknown values fall back to a gentle push in.
    """
    if not camera_movement:
        return "zoom_in"
    key = camera_movement.strip().lower().replace(" ", "_").replace("-", "_")
    if key in CAMERA_MOVEMENTS:
        return key
    if key in CAMERA_ALIASES:
        return CAMERA_ALIASES[key]
    return "zoom_in"


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

    client = None
    # Attempt 1: Anonymous connection (bypasses user token ZeroGPU exhaustion)
    try:
        client = Client("Lightricks/ltx-video-distilled", token=None)
    except Exception as e:
        logger.warning(f"Anonymous LTX client init failed ({e}). Trying with HF_TOKEN...")
        if settings.HF_TOKEN:
            try:
                client = Client("Lightricks/ltx-video-distilled", token=settings.HF_TOKEN)
            except Exception as e2:
                logger.warning(f"Token client init failed: {e2}")

    if not client:
        return None

    def _predict_with_client(c):
        if input_image_path and os.path.exists(input_image_path):
            return c.predict(
                prompt=full_prompt,
                negative_prompt=NEGATIVE_PROMPT,
                input_image_filepath=handle_file(input_image_path),
                input_video_filepath=None,
                height_ui=512,
                width_ui=704,
                mode="image-to-video",
                duration_ui=max(2, min(duration, 5)),
                ui_frames_to_use=17,
                seed_ui=42,
                randomize_seed=True,
                ui_guidance_scale=1.0,
                improve_texture_flag=True,
                api_name="/image_to_video",
            )
        else:
            return c.predict(
                prompt=full_prompt,
                negative_prompt=NEGATIVE_PROMPT,
                input_image_filepath=None,
                input_video_filepath=None,
                height_ui=512,
                width_ui=704,
                mode="text-to-video",
                duration_ui=max(2, min(duration, 5)),
                ui_frames_to_use=17,
                seed_ui=42,
                randomize_seed=True,
                ui_guidance_scale=1.0,
                improve_texture_flag=True,
                api_name="/text_to_video",
            )

    try:
        res = _predict_with_client(client)
    except Exception as pred_err:
        logger.warning(f"LTX-Video predict error ({pred_err}).")
        # If anonymous failed with quota, try with token if available
        if settings.HF_TOKEN:
            try:
                client_token = Client("Lightricks/ltx-video-distilled", token=settings.HF_TOKEN)
                res = _predict_with_client(client_token)
            except Exception:
                return None
        else:
            return None

    if isinstance(res, (tuple, list)) and len(res) > 0:
        video_info = res[0]
        if isinstance(video_info, dict) and "video" in video_info:
            return video_info["video"]
    return None


def _generate_temporal_stages(prompt: str) -> list[str]:
    """Generates 3 progressive temporal scene prompts for fluid multi-frame animation."""
    p = prompt.strip()
    p_lower = p.lower()

    if any(w in p_lower for w in ["car", "drift", "drive", "vehicle", "race"]):
        s1 = f"{p}, dynamic low-angle composition, headlights cutting through mist, beginning motion"
        s2 = f"{p}, dramatic sideways slide mid-drift, intense smoke billowing from spinning tires, motion blur, neon reflections"
        s3 = f"{p}, high speed acceleration powering out of turn, glowing taillight streaks, epic cinematic exit"
    elif any(w in p_lower for w in ["girl", "woman", "man", "person", "portrait", "face", "introducing", "talking"]):
        s1 = f"{p}, relaxed natural posture, warm cinematic lighting, soft background bokeh"
        s2 = f"{p}, turning toward camera with expressive vibrant smile, eyes sparkling, hair gently blowing, dynamic life"
        s3 = f"{p}, engaging friendly expression, subtle head movement, cinematic golden hour depth of field"
    elif any(w in p_lower for w in ["banana", "fruit", "product", "bottle", "shoe", "perfume", "watch"]):
        s1 = f"{p}, floating in clean studio space, professional commercial rim lighting"
        s2 = f"{p}, dynamic 3D rotational spin in mid-air, kinetic sparkling fluid droplets, dramatic lighting shift"
        s3 = f"{p}, hero commercial angle, volumetric light rays, immaculate high definition finish"
    else:
        s1 = f"{p}, cinematic composition, establishing scene action, professional atmospheric lighting"
        s2 = f"{p}, peak kinetic motion, dramatic dynamic transformation, fluid subject movement, motion blur"
        s3 = f"{p}, continuous fluid motion, volumetric light rays, grand cinematic climax"

    return [s1, s2, s3]


def _synthesize_progressive_motion_video(
    keyframe_paths: list[str],
    output_path: str,
    camera_movement: str = "zoom_in",
    duration_seconds: int = 4,
    fps: int = 24,
) -> str:
    """Synthesizes smooth, real multi-stage dynamic animation from progressive keyframes with camera tracking."""
    import math
    import imageio_ffmpeg
    from PIL import Image

    width, height = 768, 432  # 16:9 widescreen cinema
    total_frames = max(24, duration_seconds * fps)

    # Load and normalize all progressive keyframes
    images = []
    for path in keyframe_paths:
        with Image.open(path) as im:
            images.append(im.convert("RGB").resize((width, height), Image.Resampling.LANCZOS))

    n_segments = max(1, len(images) - 1)
    frames_per_segment = total_frames / float(n_segments)

    writer = imageio_ffmpeg.write_frames(
        output_path,
        (width, height),
        fps=fps,
        codec="libx264",
        pix_fmt_in="rgb24",
        macro_block_size=16,
    )
    writer.send(None)

    mov = _resolve_camera_movement(camera_movement)

    for i in range(total_frames):
        global_t = i / float(total_frames)

        # Stage morphing between current keyframe and next
        seg_idx = min(int(i / frames_per_segment), n_segments - 1)
        seg_t = (i - seg_idx * frames_per_segment) / frames_per_segment
        seg_t = max(0.0, min(1.0, seg_t))

        # Smooth cosine S-curve easing between stages
        ease_morph = 0.5 - 0.5 * math.cos(math.pi * seg_t)
        base_frame = Image.blend(images[seg_idx], images[seg_idx + 1], ease_morph)

        # Apply cinematic camera tracking & dynamic perspective drift
        ease_cam = 0.5 - 0.5 * math.cos(math.pi * global_t)

        margin = 1.18
        work_w, work_h = int(width * margin), int(height * margin)
        expanded = base_frame.resize((work_w, work_h), Image.Resampling.BILINEAR)

        if mov in ("orbit_360", "fpv_drone"):
            angle = ease_cam * math.pi * 0.6
            dx = int((work_w - width) * (0.5 + 0.38 * math.sin(angle)))
            dy = int((work_h - height) * (0.5 + 0.28 * math.cos(angle)))
            scale = 1.04 + 0.08 * math.sin(ease_cam * math.pi)
        elif mov == "pan_left":
            dx = int((work_w - width) * (1.0 - ease_cam))
            dy = (work_h - height) // 2
            scale = 1.05
        elif mov == "pan_right":
            dx = int((work_w - width) * ease_cam)
            dy = (work_h - height) // 2
            scale = 1.05
        elif mov in ("tilt_up", "crane_up"):
            dx = (work_w - width) // 2
            dy = int((work_h - height) * (1.0 - ease_cam))
            scale = 1.05
        elif mov == "tilt_down":
            dx = (work_w - width) // 2
            dy = int((work_h - height) * ease_cam)
            scale = 1.05
        elif mov == "zoom_out":
            scale = 1.15 - 0.12 * ease_cam
            dx = (work_w - width) // 2
            dy = (work_h - height) // 2
        elif mov == "static":
            # Locked-off tripod: keyframes still morph, the camera does not move.
            scale = 1.0
            dx = (work_w - width) // 2
            dy = (work_h - height) // 2
        else:
            # Dynamic Zoom In (Push) with cinematic drift
            scale = 1.02 + 0.14 * ease_cam
            dx = (work_w - width) // 2
            dy = (work_h - height) // 2

        crop_w = int(width / scale)
        crop_h = int(height / scale)
        cl = max(0, min(work_w - crop_w, dx))
        ct = max(0, min(work_h - crop_h, dy))

        final_frame = expanded.crop((cl, ct, cl + crop_w, ct + crop_h)).resize(
            (width, height), Image.Resampling.BILINEAR
        )
        writer.send(final_frame.tobytes())

    writer.close()
    return output_path


async def generate_video(
    prompt: str,
    duration_seconds: int,
    style: str,
    image_data: str | None = None,
    camera_movement: str = "zoom_in",
) -> tuple[str, str]:
    """Generate a video clip and report which engine actually produced it.

    Returns (video_url, engine_used) where engine_used is one of:
      "ltx-video"      - real AI diffusion video from the LTX-Video model
      "keyframe-motion" - fallback: generated stills crossfaded with a camera move
    """
    full_prompt = _clean_and_enrich_prompt(prompt, style.lower().replace(" ", "_"))

    filename = f"{uuid.uuid4()}.mp4"
    filepath = os.path.join("data", "videos", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    input_img_path = None
    if image_data:
        try:
            if "," in image_data:
                image_data = image_data.split(",", 1)[1]
            raw_bytes = base64.b64decode(image_data)
            input_img_path = os.path.join("data", "images", f"temp_{uuid.uuid4()}.png")
            with open(input_img_path, "wb") as f:
                f.write(raw_bytes)
        except Exception as e:
            logger.warning(f"Could not decode input image: {e}")

    # Tier 1: True LTX-Video AI Diffusion Generation
    try:
        temp_video_path = await asyncio.to_thread(
            _call_ltx_video, full_prompt, duration_seconds, input_img_path
        )
        if temp_video_path and os.path.exists(temp_video_path):
            shutil.copyfile(temp_video_path, filepath)
            return f"/data/videos/{filename}", "ltx-video"
    except Exception as e:
        logger.warning(
            f"LTX-Video space unavailable ({e}). Engaging Progressive Generative Motion Engine..."
        )

    # Tier 2: Progressive Multi-Stage Generative Motion Engine
    temp_keyframe_paths = []
    try:
        from app.services.image_service import generate_image

        stages = _generate_temporal_stages(full_prompt)

        # If user uploaded an image, use it as Stage 0
        if input_img_path and os.path.exists(input_img_path):
            keyframe_paths = [input_img_path]
            # Generate stages 1 and 2
            tasks = [
                generate_image(stage, NEGATIVE_PROMPT, 896, 512, style if style else "photorealistic")
                for stage in stages[1:]
            ]
            gen_results = await asyncio.gather(*tasks)
            for _, path in gen_results:
                keyframe_paths.append(path)
                temp_keyframe_paths.append(path)
        else:
            # Generate all 3 progressive stages in parallel
            tasks = [
                generate_image(stage, NEGATIVE_PROMPT, 896, 512, style if style else "photorealistic")
                for stage in stages
            ]
            gen_results = await asyncio.gather(*tasks)
            keyframe_paths = [path for _, path in gen_results]
            temp_keyframe_paths.extend(keyframe_paths)

        # Synthesize fluid multi-stage motion with camera tracking
        await asyncio.to_thread(
            _synthesize_progressive_motion_video,
            keyframe_paths,
            filepath,
            camera_movement,
            max(3, min(duration_seconds, 6)),
            24,
        )

        if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
            return f"/data/videos/{filename}", "keyframe-motion"

    except Exception as fallback_err:
        logger.error(f"Generative motion engine failed: {fallback_err}")
        raise RuntimeError(f"Video generation error: {str(fallback_err)}")

    finally:
        if input_img_path and os.path.exists(input_img_path) and "temp_" in input_img_path:
            try:
                os.remove(input_img_path)
            except Exception:
                pass
        for p in temp_keyframe_paths:
            if os.path.exists(p) and "temp_" in p:
                try:
                    os.remove(p)
                except Exception:
                    pass

    raise RuntimeError("Could not generate video clip. Please try a different prompt.")
