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
    camera_movement: str = "zoom_in"

class VideoGenerateResponse(BaseModel):
    id: str
    video_url: str
    model_used: str
    engine_used: str  # 'ltx-video' (AI diffusion) or 'keyframe-motion' (still-frame slideshow)
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

class VideoStitchRequest(BaseModel):
    video_urls: List[str]
    transition: str = "cut"  # 'cut' or 'crossfade'
    transition_duration: float = 0.5

class VideoStitchResponse(BaseModel):
    video_url: str
    duration_seconds: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    clip_count: int
    has_audio: bool
    source_duration: float

class VoiceoverGenerateRequest(BaseModel):
    script: str
    preset_id: str = "brand_friendly"
    voice: Optional[str] = None   # edge-tts ShortName, overrides the preset
    rate: Optional[str] = None    # e.g. "+10%"
    pitch: Optional[str] = None   # e.g. "-2Hz"

class VoiceoverGenerateResponse(BaseModel):
    audio_url: str
    duration_seconds: Optional[float] = None
    voice_used: str
    engine_used: str

class VoiceoverAttachRequest(BaseModel):
    video_url: str
    audio_url: str
    fit: str = "pad"  # 'pad' holds the last frame, 'truncate' cuts at the shorter track

class VoiceoverAttachResponse(BaseModel):
    video_url: str
    fit: str

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
