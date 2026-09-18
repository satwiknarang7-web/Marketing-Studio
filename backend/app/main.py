import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.models.database import engine, Base
from app.config import settings

from app.routers import text, image, video, history, brand_kit, photoshoot, virality

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create directories
    os.makedirs("data/images", exist_ok=True)
    os.makedirs("data/videos", exist_ok=True)
    
    yield
    # Shutdown

app = FastAPI(title="Segue IT Marketing Studio API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
import os
os.makedirs("data", exist_ok=True)
app.mount("/data", StaticFiles(directory="data"), name="data")

# Include routers
app.include_router(text.router, prefix="/api")
app.include_router(image.router, prefix="/api")
app.include_router(video.router, prefix="/api")
app.include_router(photoshoot.router, prefix="/api")
app.include_router(virality.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(brand_kit.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
