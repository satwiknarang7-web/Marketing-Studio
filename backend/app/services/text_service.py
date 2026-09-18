import asyncio
from huggingface_hub import InferenceClient
from app.config import settings
from app.prompts.templates import TEMPLATES

# Use featherless-ai router provider for Qwen models on modern HF router
client = (
    InferenceClient(provider="featherless-ai", token=settings.HF_TOKEN)
    if settings.HF_TOKEN
    else None
)
fallback_client = InferenceClient(token=settings.HF_TOKEN) if settings.HF_TOKEN else None


async def generate_text(
    template: str,
    prompt: str,
    tone: str,
    length: str,
    variations_count: int,
) -> list[str]:
    system_prompt = TEMPLATES.get(
        template,
        "You are an expert marketing copywriter for Segue IT.\nPrompt: {prompt}\nTone: {tone}\nLength: {length}",
    ).format(prompt=prompt, tone=tone, length=length)

    max_tokens = {"short": 150, "medium": 350, "long": 700}.get(length, 350)

    if not client:
        await asyncio.sleep(1)
        return [
            f"[Demo Copy] Variation {i+1} for: {prompt}\n\nBoost your business with cutting-edge solutions from Segue IT."
            for i in range(variations_count)
        ]

    results = []
    for _ in range(variations_count):

        def _generate():
            # Try chat.completions on featherless-ai provider first
            try:
                response = client.chat.completions.create(
                    model=settings.TEXT_MODEL,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a professional marketing copywriter for Segue IT. Write compelling, high-converting copy.",
                        },
                        {"role": "user", "content": system_prompt},
                    ],
                    max_tokens=max_tokens,
                    temperature=0.7,
                )
                return response.choices[0].message.content
            except Exception:
                # Fallback to standard client
                if fallback_client:
                    response = fallback_client.chat.completions.create(
                        model=settings.TEXT_MODEL,
                        messages=[{"role": "user", "content": system_prompt}],
                        max_tokens=max_tokens,
                    )
                    return response.choices[0].message.content
                raise

        try:
            res = await asyncio.to_thread(_generate)
            results.append(res)
        except Exception as e:
            results.append(f"Generation error: {str(e)}")

    return results
