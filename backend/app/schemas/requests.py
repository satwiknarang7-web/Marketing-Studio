from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class TextGenerateRequest(BaseModel):
    template: str
    prompt: str
    tone: str = "professional"
    length: str = "medium"
    variations_count: int = 1

class TextGenerateResponse(BaseModel):
    id: str
    contents: List[str]
    model_used: str
    created_at: datetime

class ImageGenerateRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    width: int = 1024
    height: int = 1024
    style: str = "photorealistic"

class ImageGenerateResponse(BaseModel):
    id: str
    images: List[str]
    model_used: str
    created_at: datetime

class VideoGenerateRequest(BaseModel):
    prompt: str
    duration_seconds: int = 3
    style: str = "cinematic"
    image_data: Optional[str] = None

class VideoGenerateResponse(BaseModel):
    id: str
    video_url: str
    model_used: str
    created_at: datetime

class PhotoshootGenerateRequest(BaseModel):
    mode: str
    prompt: str
    image_data: Optional[str] = None
    aspect_ratio: str = "1:1"
    count: int = 1
    engine: str = "auto"  # 'higgsfield', 'huggingface', 'auto'

class PhotoshootGenerateResponse(BaseModel):
    id: str
    images: List[str]  # base64 or URLs
    mode: str
    enhanced_prompt: str
    engine_used: str
    created_at: datetime

class ViralityScoreRequest(BaseModel):
    video_url: str
    title: Optional[str] = None
    target_platform: Optional[str] = "tiktok_reels"

class ViralityScoreResponse(BaseModel):
    id: str
    virality_score: int  # 0 - 100
    hook_score: int      # 0 - 100
    retention_score: int # 0 - 100
    engagement_potential: str  # 'High', 'Moderate', 'Viral Outlier'
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    platform_breakdown: dict
    created_at: datetime

class HistoryItem(BaseModel):
    id: str
    type: str
    prompt: str
    result: Any
    model_used: str
    template: Optional[str] = None
    created_at: datetime

class HistoryListResponse(BaseModel):
    items: List[HistoryItem]
    total: int
    page: int
    limit: int

class BrandKitRequest(BaseModel):
    company_name: str
    brand_colors: List[str]
    tone_guidelines: Optional[str] = None
    default_hashtags: Optional[str] = None
    logo_path: Optional[str] = None

class BrandKitResponse(BaseModel):
    id: str
    company_name: str
    brand_colors: List[str]
    tone_guidelines: Optional[str] = None
    default_hashtags: Optional[str] = None
    logo_path: Optional[str] = None
    updated_at: datetime
