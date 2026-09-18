from fastapi import APIRouter, HTTPException
from app.schemas.requests import (
    VoiceoverGenerateRequest,
    VoiceoverGenerateResponse,
    VoiceoverAttachRequest,
    VoiceoverAttachResponse,
)
from app.services.audio_service import (
    VOICE_PRESETS,
    synthesize_speech,
    attach_voiceover,
    list_voices,
)

router = APIRouter(prefix="/audio", tags=["Audio & Voiceover"])


@router.get("/presets")
async def get_voice_presets():
    """Curated delivery presets for marketing voiceover."""
    return [
        {"id": p["id"], "name": p["name"], "tone": p["tone"], "voice": p["voice"]}
        for p in VOICE_PRESETS
    ]


@router.get("/voices")
async def get_voices(locale: str = "en-"):
    """Full catalogue of free neural voices, filtered by locale prefix."""
    try:
        return await list_voices(locale_prefix=locale)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not load voice list: {e}")


@router.post("/tts", response_model=VoiceoverGenerateResponse)
async def generate_voiceover(req: VoiceoverGenerateRequest):
    try:
        audio_url, duration, voice_used = await synthesize_speech(
            script=req.script,
            preset_id=req.preset_id,
            voice=req.voice,
            rate=req.rate,
            pitch=req.pitch,
        )
        return VoiceoverGenerateResponse(
            audio_url=audio_url,
            duration_seconds=duration,
            voice_used=voice_used,
            engine_used="edge-tts",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice synthesis failed: {e}")


@router.post("/attach", response_model=VoiceoverAttachResponse)
async def attach_voiceover_endpoint(req: VoiceoverAttachRequest):
    """Mux a generated voiceover onto a generated video."""
    if req.fit not in ("pad", "truncate"):
        raise HTTPException(status_code=400, detail="fit must be 'pad' or 'truncate'")
    try:
        video_url = await attach_voiceover(req.video_url, req.audio_url, req.fit)
        return VoiceoverAttachResponse(video_url=video_url, fit=req.fit)
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not attach voiceover: {e}")
