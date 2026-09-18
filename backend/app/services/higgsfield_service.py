import asyncio
import subprocess
import json
import logging
from typing import Dict, List, Tuple
from app.services.image_service import generate_image

logger = logging.getLogger(__name__)

# Official Higgsfield Product Photoshoot Modes & Prompt Enhancers
PHOTOSHOOT_MODES: Dict[str, Dict[str, str]] = {
    "product_shot": {
        "name": "Studio Product Shot",
        "description": "Product on clean, neutral, or seamless studio catalog background",
        "prefix": "commercial catalog product photograph, clean seamless studio background, sharp focus, professional softbox and rim lighting, 8k resolution, crisp textures",
        "aspect": "1:1",
    },
    "lifestyle_scene": {
        "name": "Lifestyle Scene",
        "description": "Product in a real-world environment, natural action, and atmosphere",
        "prefix": "commercial lifestyle product photography in an authentic modern environment, natural golden hour lighting, cinematic depth of field, real-world context",
        "aspect": "1:1",
    },
    "closeup_product_with_person": {
        "name": "Person & Hands Closeup",
        "description": "Tight crop with hands or partial face demonstrating or holding the product",
        "prefix": "intimate commercial closeup shot of manicured hands delicately holding the product, aesthetic natural skin details, clean focal point, high-end beauty advertisement",
        "aspect": "4:5",
    },
    "moodboard_pin": {
        "name": "Moodboard / Pinterest Pin",
        "description": "Vertical 2:3 Pinterest-native editorial aesthetic with organic textures",
        "prefix": "vertical editorial Pinterest-native moodboard aesthetic, curated earthy textures, soft dappled daylight, minimalist styling, magazine editorial feel",
        "aspect": "9:16",
    },
    "hero_banner": {
        "name": "Hero Banner",
        "description": "Wide-format website, email, or campaign header with copy space",
        "prefix": "wide format website hero banner, clean negative copy space on the side, sleek commercial lighting, crisp architectural framing, luxury brand campaign",
        "aspect": "16:9",
    },
    "social_carousel": {
        "name": "Social Carousel Slide",
        "description": "Engaging, swipe-worthy visual for Instagram, LinkedIn, or Facebook",
        "prefix": "bold modern social media carousel visual, eye-catching color blocking, high conversion commercial aesthetic, clean modern typography framing",
        "aspect": "1:1",
    },
    "ad_creative_pack": {
        "name": "DTC Ad Creative Pack",
        "description": "Coordinated commercial ad variants optimized for Meta & TikTok feeds",
        "prefix": "high-converting DTC ad creative, vibrant scroll-stopping visuals, punchy commercial clarity, optimized for social media performance marketing",
        "aspect": "4:5",
    },
    "virtual_model_tryout": {
        "name": "Virtual Model Tryout",
        "description": "Product worn or showcased by a stylish AI-rendered fashion model",
        "prefix": "high fashion commercial lookbook photoshoot, elegant stylish model naturally wearing and showcasing the product, soft diffused studio lighting, Vogue editorial aesthetic",
        "aspect": "4:5",
    },
    "conceptual_product": {
        "name": "Conceptual & Surreal",
        "description": "Surreal CGI, levitating product, dynamic liquid/powder splash",
        "prefix": "surreal avant-garde product showcase, levitating floating product with dynamic sculpted liquid splash, dramatic sculptural studio lighting, hyper-detailed 3D octane render",
        "aspect": "1:1",
    },
    "restyle": {
        "name": "Aesthetic Restyle",
        "description": "Elevated brand restyling, premium seasonal aesthetic and color grading",
        "prefix": "premium boutique restyling, sophisticated architectural atmosphere, elevated seasonal color grading, refined luxury aesthetic",
        "aspect": "1:1",
    },
}


def is_higgsfield_cli_authenticated() -> bool:
    """Check if the local Higgsfield CLI has an active authenticated session."""
    try:
        res = subprocess.run(
            ["higgsfield", "account", "status"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        return res.returncode == 0 and "Error" not in res.stderr
    except Exception:
        return False


async def execute_photoshoot(
    mode: str,
    prompt: str,
    image_data: str | None = None,
    aspect_ratio: str = "1:1",
    count: int = 1,
    engine: str = "auto",
) -> Tuple[List[str], str, str]:
    """Generates brand-quality product images across the 10 photoshoot modes.

    Uses Higgsfield CLI if authenticated, or FLUX.1-schnell hybrid engine.
    """
    mode_info = PHOTOSHOOT_MODES.get(mode, PHOTOSHOOT_MODES["product_shot"])
    enhanced_prompt = f"{mode_info['prefix']}, {prompt}"

    # Determine resolution from aspect ratio
    dims = {
        "1:1": (1024, 1024),
        "4:5": (896, 1120),
        "9:16": (768, 1344),
        "16:9": (1344, 768),
    }.get(aspect_ratio, (1024, 1024))

    # Try Higgsfield CLI if requested and authenticated
    if engine in ["higgsfield", "auto"] and is_higgsfield_cli_authenticated():
        try:
            cmd = [
                "higgsfield",
                "product-photoshoot",
                "create",
                "--mode",
                mode,
                "--prompt",
                prompt,
                "--count",
                str(count),
                "--json",
            ]
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, _ = await proc.communicate()
            if proc.returncode == 0:
                data = json.loads(stdout.decode())
                urls = [item.get("url") for item in data if isinstance(item, dict) and "url" in item]
                if urls:
                    return urls, enhanced_prompt, "higgsfield-cli"
        except Exception as e:
            logger.warning(f"Higgsfield CLI photoshoot failed, falling back to hybrid engine: {e}")

    # Hybrid Fallback: FLUX.1-schnell with official Higgsfield prompt enhancement
    images: List[str] = []
    for _ in range(count):
        img_b64, _ = await generate_image(
            prompt=enhanced_prompt,
            negative_prompt="blurry, distorted, low quality, bad composition, watermark, text artifacts",
            width=dims[0],
            height=dims[1],
            style="photorealistic",
        )
        images.append(f"data:image/png;base64,{img_b64}")

    return images, enhanced_prompt, "hybrid-flux-engine"
