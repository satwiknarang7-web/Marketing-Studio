import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import get_db, Generation
from app.schemas.requests import TextGenerateRequest, TextGenerateResponse
from app.services.text_service import generate_text
from app.config import settings
import uuid

router = APIRouter(prefix="/text", tags=["Text"])

@router.post("/generate", response_model=TextGenerateResponse)
async def generate_text_endpoint(req: TextGenerateRequest, db: AsyncSession = Depends(get_db)):
    try:
        contents = await generate_text(req.template, req.prompt, req.tone, req.length, req.variations_count)
        
        gen_id = str(uuid.uuid4())
        gen = Generation(
            id=gen_id,
            type="text",
            prompt=req.prompt,
            result=json.dumps(contents),
            model_used=settings.TEXT_MODEL,
            template=req.template,
            tone=req.tone
        )
        db.add(gen)
        await db.commit()
        await db.refresh(gen)
        
        return TextGenerateResponse(
            id=gen.id,
            contents=contents,
            model_used=gen.model_used,
            created_at=gen.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
