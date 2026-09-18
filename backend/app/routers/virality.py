import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.schemas.requests import ViralityScoreRequest, ViralityScoreResponse
from app.services.higgsfield_service import analyze_virality

router = APIRouter(prefix="/virality", tags=["Virality Predictor"])


@router.post("/score", response_model=ViralityScoreResponse)
async def score_virality_endpoint(req: ViralityScoreRequest):
    try:
        data = await analyze_virality(
            video_url=req.video_url,
            title=req.title,
            platform=req.target_platform or "tiktok_reels",
        )

        return ViralityScoreResponse(
            id=str(uuid.uuid4()),
            virality_score=data.get("virality_score", 85),
            hook_score=data.get("hook_score", 88),
            retention_score=data.get("retention_score", 80),
            engagement_potential=data.get("engagement_potential", "High"),
            strengths=data.get("strengths", []),
            weaknesses=data.get("weaknesses", []),
            recommendations=data.get("recommendations", []),
            platform_breakdown=data.get(
                "platform_breakdown",
                {
                    "TikTok": 85,
                    "Instagram_Reels": 88,
                    "YouTube_Shorts": 82,
                    "LinkedIn_Video": 75,
                },
            ),
            created_at=datetime.utcnow(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
