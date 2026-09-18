import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import get_db, Generation
from app.schemas.requests import ImageGenerateRequest, ImageGenerateResponse
from app.services.image_service import generate_image
from app.config import settings
import uuid

router = APIRouter(prefix="/image", tags=["Image"])

@router.post("/generate", response_model=ImageGenerateResponse)
async def generate_image_endpoint(req: ImageGenerateRequest, db: AsyncSession = Depends(get_db)):
    try:
        b64_img, filepath = await generate_image(req.prompt, req.negative_prompt, req.width, req.height, req.style)
        
        gen_id = str(uuid.uuid4())
        images_list = [f"data:image/png;base64,{b64_img}"]
        gen = Generation(
            id=gen_id,
            type="image",
            prompt=req.prompt,
            result=json.dumps({"filepath": filepath, "images": images_list}),
            model_used=settings.IMAGE_MODEL,
            style=req.style,
            width=req.width,
            height=req.height
        )
        db.add(gen)
        await db.commit()
        await db.refresh(gen)
        
        return ImageGenerateResponse(
            id=gen.id,
            images=images_list,
            model_used=gen.model_used,
            created_at=gen.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
