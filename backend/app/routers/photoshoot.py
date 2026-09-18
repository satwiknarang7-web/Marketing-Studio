import uuid
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import get_db, Generation
from app.schemas.requests import PhotoshootGenerateRequest, PhotoshootGenerateResponse
from app.services.higgsfield_service import execute_photoshoot, PHOTOSHOOT_MODES

router = APIRouter(prefix="/photoshoot", tags=["Product Photoshoot"])


@router.get("/modes")
async def get_photoshoot_modes():
    """Returns the 10 Higgsfield commercial photoshoot modes."""
    return [
        {
            "id": k,
            "name": v["name"],
            "description": v["description"],
            "aspect_ratio": v["aspect"],
        }
        for k, v in PHOTOSHOOT_MODES.items()
    ]


@router.post("/generate", response_model=PhotoshootGenerateResponse)
async def generate_photoshoot(
    req: PhotoshootGenerateRequest, db: AsyncSession = Depends(get_db)
):
    try:
        images, enhanced_prompt, engine_used = await execute_photoshoot(
            mode=req.mode,
            prompt=req.prompt,
            image_data=req.image_data,
            aspect_ratio=req.aspect_ratio,
            count=req.count,
            engine=req.engine,
        )

        gen_id = str(uuid.uuid4())
        gen = Generation(
            id=gen_id,
            type="image",
            prompt=f"[{req.mode}] {req.prompt}",
            result=json.dumps({"images": images, "mode": req.mode}),
            model_used=f"Higgsfield Photoshoot ({engine_used})",
            style=req.mode,
        )
        db.add(gen)
        await db.commit()
        await db.refresh(gen)

        return PhotoshootGenerateResponse(
            id=gen.id,
            images=images,
            mode=req.mode,
            enhanced_prompt=enhanced_prompt,
            engine_used=engine_used,
            created_at=gen.created_at,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
