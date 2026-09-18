import uuid
from datetime import datetime
from typing import AsyncGenerator
from sqlalchemy import Column, String, DateTime, Text, Integer, JSON
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

class Generation(Base):
    __tablename__ = "generations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String, nullable=False) # text, image, video
    prompt = Column(Text, nullable=False)
    result = Column(Text, nullable=False) # JSON text
    model_used = Column(String, nullable=False)
    template = Column(String, nullable=True)
    tone = Column(String, nullable=True)
    style = Column(String, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class BrandKit(Base):
    __tablename__ = "brand_kit"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_name = Column(String, nullable=False)
    brand_colors = Column(JSON, nullable=False)
    tone_guidelines = Column(Text, nullable=True)
    default_hashtags = Column(Text, nullable=True)
    logo_path = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
