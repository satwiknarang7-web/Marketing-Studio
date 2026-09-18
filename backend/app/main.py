import os
import sys

# Ensure backend directory is in sys.path regardless of execution working directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

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
    allow_origins=settings.get_cors_origins(),
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
