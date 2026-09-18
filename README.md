# Segue IT Marketing Studio (Higgsfield AI Creative Suite)

A 100% free, open-source generative AI marketing and creative studio built with the **Higgsfield AI** architecture, styled with a sleek obsidian and electric blue aesthetic. Generate commercial product photoshoots across 10 specialized modes, produce motion video ads with director camera controls, and create high-converting marketing copy — all on free, open models.

---

## ✨ Features & Studios

- **Explore & Model Showcase** — Top widescreen showcase carousel with looping video previews, quick model launcher, and real-time status indicators.
- **Product Photoshoot Studio (`/product-photoshoot`)** — 10 commercial advertising photoshoot modes based on `higgsfield-ai/skills` with product reference image upload and dual-engine backend (`@higgsfield/cli` + FLUX.1 hybrid fallback).
- **Video Studio (`/video-studio`)** — Director camera controls (Pan, Tilt, Zoom, Orbit 360°, Crane, FPV Drone, Static) that drive the rendered camera path, optical focal lengths (24mm, 35mm, 50mm, 85mm), aspect ratios (16:9, 9:16, 1:1, 4:5), and looping video feed.
- **Cinema Studio (`/cinema`)** — Virtual camera bodies (ARRI Alexa 35, RED V-Raptor, Sony Venice 2), cinema lenses, f-stop depth of field, and stacked dynamic motion paths.
- **Higgsfield Genjutsu (`/genjutsu`)** — Video-to-Video metamorphosis, camera reframe, world morph, and cinematic style transfer.
- **Image Studio (`/image-studio`)** — 4K commercial visuals powered by FLUX.1-schnell and Nano Banana Pro presets.
- **ChatGPT Plugin Studio (`/chatgpt-plugin`)** — In-conversation prompt runner with mobile UGC preview.
- **Audio & Voice Studio (`/audio`)** — Script read-aloud preview using your computer's built-in speech synthesis. No AI model and no exported audio file; use it to check pacing before recording.
- **Developer API & MCP (`/api-docs` & `/mcp`)** — Direct REST API documentation and pre-configured Model Context Protocol server for AI agent pairing.
- **Assets Vault (`/history`)** — Unified management for past videos, photoshoots, images, and marketing copy.

---

## ⚙️ How video generation actually works

Video runs on two tiers, and **the UI always tells you which one produced your clip**:

| Tier | Engine | What it is |
|:-----|:-------|:-----------|
| 1 | `ltx-video` | Real AI diffusion video from Lightricks LTX-Video. Badged **"AI video"**. |
| 2 | `keyframe-motion` | Fallback when LTX is unavailable: three generated stills crossfaded with a real camera move. Badged **"Keyframe motion"**. |

Tier 2 is a legitimate free fallback, but it is **not** AI-generated motion — it is a
moving-camera slideshow. The response carries `engine_used`, the history record stores the
engine that actually ran, and the player shows a badge plus a one-line explanation. Never
present a Tier 2 clip as model-generated video.

**Known limits:** clips cap at ~5s (LTX) / ~6s (fallback); FPV Drone and Orbit 360° currently
share one motion path; there is no audio track on generated video yet.

---

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy (async), SQLite, `@higgsfield/cli` v1.1.25 |
| **Video Engine** | Lightricks LTX-Video Distilled (via Hugging Face Gradio Client), with keyframe-motion fallback |
| **Image Engine** | Black Forest Labs FLUX.1-schnell |
| **Text Engine** | Qwen 2.5 7B Instruct |

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux

# Add your free Hugging Face token in backend/.env:
# HF_TOKEN=hf_your_token_here

# Start the FastAPI backend
uvicorn app.main:app --reload --port 8000
```

The backend runs on `http://localhost:8000`. Interactive docs are available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev:3001
```

Open `http://localhost:3001` in your browser.

---

## 📄 License

MIT License — free for commercial and personal use.
