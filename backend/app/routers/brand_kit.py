from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.database import get_db, BrandKit
from app.schemas.requests import BrandKitRequest, BrandKitResponse
import uuid

router = APIRouter(prefix="/brand-kit", tags=["BrandKit"])

@router.get("", response_model=BrandKitResponse)
async def get_brand_kit(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BrandKit).limit(1))
    bk = result.scalar_one_or_none()
    
    if not bk:
        # Return empty default
        return BrandKitResponse(
            id="default",
            company_name="",
            brand_colors=[],
            updated_at="1970-01-01T00:00:00Z" # type: ignore
        )
        
    return BrandKitResponse(
        id=bk.id,
        company_name=bk.company_name,
        brand_colors=bk.brand_colors,
        tone_guidelines=bk.tone_guidelines,
        default_hashtags=bk.default_hashtags,
        logo_path=bk.logo_path,
        updated_at=bk.updated_at
    )

@router.put("", response_model=BrandKitResponse)
async def update_brand_kit(req: BrandKitRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BrandKit).limit(1))
    bk = result.scalar_one_or_none()
    
    if not bk:
        bk = BrandKit(
            id=str(uuid.uuid4()),
            company_name=req.company_name,
            brand_colors=req.brand_colors,
            tone_guidelines=req.tone_guidelines,
            default_hashtags=req.default_hashtags,
            logo_path=req.logo_path
        )
        db.add(bk)
    else:
        bk.company_name = req.company_name
        bk.brand_colors = req.brand_colors
        bk.tone_guidelines = req.tone_guidelines
        bk.default_hashtags = req.default_hashtags
        bk.logo_path = req.logo_path
        
    await db.commit()
    await db.refresh(bk)
    
    return BrandKitResponse(
        id=bk.id,
        company_name=bk.company_name,
        brand_colors=bk.brand_colors,
        tone_guidelines=bk.tone_guidelines,
        default_hashtags=bk.default_hashtags,
        logo_path=bk.logo_path,
        updated_at=bk.updated_at
    )
