import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import get_db, Generation
from app.schemas.requests import (
    VideoGenerateRequest,
    VideoGenerateResponse,
    VideoStitchRequest,
    VideoStitchResponse,
)
from app.services.video_service import generate_video
from app.services.video_edit_service import stitch_clips
from app.config import settings
import uuid

router = APIRouter(prefix="/video", tags=["Video"])

# What actually produced the clip, for the history record and the UI badge.
ENGINE_LABELS = {
    "ltx-video": settings.VIDEO_MODEL,
    "keyframe-motion": f"{settings.IMAGE_MODEL} keyframes + camera motion",
}


@router.post("/generate", response_model=VideoGenerateResponse)
async def generate_video_endpoint(req: VideoGenerateRequest, db: AsyncSession = Depends(get_db)):
    try:
        video_url, engine_used = await generate_video(
            req.prompt,
            req.duration_seconds,
            req.style,
            req.image_data,
            req.camera_movement,
        )

        gen_id = str(uuid.uuid4())
        gen = Generation(
            id=gen_id,
            type="video",
            prompt=req.prompt,
            result=json.dumps({"video_url": video_url, "engine_used": engine_used}),
            model_used=ENGINE_LABELS.get(engine_used, engine_used),
            style=req.style,
            duration=req.duration_seconds
        )
        db.add(gen)
        await db.commit()
        await db.refresh(gen)

        return VideoGenerateResponse(
            id=gen.id,
            video_url=video_url,
            model_used=gen.model_used,
            engine_used=engine_used,
            created_at=gen.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stitch", response_model=VideoStitchResponse)
async def stitch_video_endpoint(req: VideoStitchRequest, db: AsyncSession = Depends(get_db)):
    """Join generated clips into one longer video."""
    try:
        result = await stitch_clips(
            req.video_urls, req.transition, req.transition_duration
        )

        gen = Generation(
            id=str(uuid.uuid4()),
            type="video",
            prompt=f"Joined {result['clip_count']} clips ({req.transition})",
            result=json.dumps({"video_url": result["video_url"], "engine_used": "stitch"}),
            model_used=f"ffmpeg stitch ({req.transition})",
            duration=int(result["duration_seconds"] or 0),
        )
        db.add(gen)
        await db.commit()

        return VideoStitchResponse(**result)
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
