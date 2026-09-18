import asyncio
import uuid
import os
import base64
from io import BytesIO
from huggingface_hub import InferenceClient
from app.config import settings
from PIL import Image, ImageDraw, ImageFont

client = InferenceClient(token=settings.HF_TOKEN) if settings.HF_TOKEN else None

STYLE_PREFIXES = {
    "photorealistic": "photorealistic, professional photography, high resolution, sharp focus",
    "illustration": "digital illustration, hand-drawn style, artistic, colorful",
    "3d_render": "3D render, octane render, volumetric lighting, studio quality",
    "flat_design": "flat design, vector art, clean lines, minimal, modern graphic design",
    "watercolor": "watercolor painting, soft edges, artistic, hand-painted texture",
    "minimalist": "minimalist design, clean, simple, elegant, lots of whitespace",
}


async def generate_image(
    prompt: str,
    negative_prompt: str | None,
    width: int,
    height: int,
    style: str,
) -> tuple[str, str]:
    """Generate a marketing image using Hugging Face Inference API."""
    style_prefix = STYLE_PREFIXES.get(style, style)
    full_prompt = f"{style_prefix}, {prompt}" if style_prefix else prompt

    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join("data", "images", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    if not client:
        # Generate a branded mock image when no HF token is available
        await asyncio.sleep(2)
        img = Image.new("RGB", (width, height), color=(30, 58, 95))
        d = ImageDraw.Draw(img)
        # Draw centered mock text
        mock_text = f"Segue IT\nMock Preview\n\n{prompt[:50]}..."
        try:
            font = ImageFont.truetype("arial.ttf", max(16, width // 30))
        except (OSError, IOError):
            font = ImageFont.load_default()
        d.multiline_text(
            (width // 10, height // 4),
            mock_text,
            fill=(255, 255, 255),
            font=font,
        )
        img.save(filepath)
    else:

        def _generate():
            kwargs = {
                "prompt": full_prompt,
                "model": settings.IMAGE_MODEL,
                "width": width,
                "height": height,
            }
            if negative_prompt:
                kwargs["negative_prompt"] = negative_prompt
            return client.text_to_image(**kwargs)

        try:
            img = await asyncio.to_thread(_generate)
            img.save(filepath)
        except Exception as e:
            raise RuntimeError(f"Error generating image: {str(e)}")

    # Read back and encode to base64
    with open(filepath, "rb") as f:
        img_bytes = f.read()
    b64 = base64.b64encode(img_bytes).decode("utf-8")

    return b64, filepath
