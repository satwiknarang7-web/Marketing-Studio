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


async def generate_video(
    prompt: str,
    duration_seconds: int,
    style: str,
    image_data: str | None = None,
) -> str:
    """Generate a real AI video clip using the Lightricks LTX-Video model."""
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

    try:
        temp_video_path = await asyncio.to_thread(
            _call_ltx_video, full_prompt, duration_seconds, input_img_path
        )
        if temp_video_path and os.path.exists(temp_video_path):
            shutil.copyfile(temp_video_path, filepath)
            return f"/data/videos/{filename}"
    except Exception as e:
        logger.error(f"LTX-Video generation failed: {e}")
        raise RuntimeError(f"Video generation error: {str(e)}")
    finally:
        if input_img_path and os.path.exists(input_img_path):
            try:
                os.remove(input_img_path)
            except Exception:
                pass

    raise RuntimeError("Model did not return a valid video file.")
