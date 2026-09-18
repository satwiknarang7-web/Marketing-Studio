# Segue IT Marketing Studio (Higgsfield AI Creative Suite)

A 100% free, open-source generative AI marketing and creative studio built with the **Higgsfield AI** architecture, styled with a sleek obsidian and electric blue aesthetic. Generate commercial product photoshoots across 10 specialized modes, produce motion video ads with director camera controls, and create high-converting marketing copy — all on free, open models.

---

## ✨ Features & Studios

- **Explore & Model Showcase** — Top widescreen showcase carousel with looping video previews, quick model launcher, and real-time status indicators.
- **Product Photoshoot Studio (`/product-photoshoot`)** — 10 commercial advertising photoshoot modes based on `higgsfield-ai/skills` with product reference image upload and dual-engine backend (`@higgsfield/cli` + FLUX.1 hybrid fallback).
- **Stitch (`/stitch`)** — Build a timeline from generated clips and join them into one longer video with hard cuts or crossfades, then narrate the whole cut.
- **Video Studio (`/video-studio`)** — Director camera controls (Pan, Tilt, Zoom, Orbit 360°, Crane, FPV Drone, Static) that drive the rendered camera path, optical focal lengths (24mm, 35mm, 50mm, 85mm), aspect ratios (16:9, 9:16, 1:1, 4:5), and looping video feed.
- **Cinema Studio (`/cinema`)** — Virtual camera bodies (ARRI Alexa 35, RED V-Raptor, Sony Venice 2), cinema lenses, f-stop depth of field, and stacked dynamic motion paths.
- **Higgsfield Genjutsu (`/genjutsu`)** — Video-to-Video metamorphosis, camera reframe, world morph, and cinematic style transfer.
- **Image Studio (`/image-studio`)** — 4K commercial visuals powered by FLUX.1-schnell and Nano Banana Pro presets.
- **ChatGPT Plugin Studio (`/chatgpt-plugin`)** — In-conversation prompt runner with mobile UGC preview.
- **Voiceover Studio (`/audio`)** — Neural text-to-speech across 47 free English voices (322 total incl. other languages). Pick a delivery preset or any specific voice, adjust speed, and download an MP3. Voiceovers can be attached to any generated clip from Video Studio.
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
share one motion path.

---

## 🎙️ Voiceover

Speech is generated with **edge-tts** — free, no API key, no GPU, and no per-user quota,
which is why it is the default rather than a Hugging Face Space. 322 neural voices, 47 of
them English.

Generate an MP3 in Voiceover Studio, or add one directly to a clip from Video Studio's
**Add voiceover** panel. Two fit modes, neither of which discards content:

| Fit | Behaviour |
|:----|:----------|
| **Hold last frame** (default) | Voiceover longer than the clip → freeze the final frame until the script finishes. Clip longer → keep every frame, audio simply ends early. |
| **Trim to shortest** | Cut at whichever track ends first. |

Audio is muxed with the `ffmpeg` binary already bundled via `imageio-ffmpeg`, so there is
nothing extra to install. Synthesis retries up to 3 times, because the upstream service
intermittently returns an empty stream.

> **Worth knowing:** edge-tts speaks to Microsoft Edge's Read Aloud endpoint, which is not a
> documented public API. It is free and unlimited today, but it is a third-party dependency
> outside our control. For a fully self-hosted alternative, `kokoro` (~350MB model, needs
> torch) runs entirely offline and can be dropped in behind the same service interface.

---

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy (async), SQLite, `@higgsfield/cli` v1.1.25 |
| **Video Engine** | Lightricks LTX-Video Distilled (via Hugging Face Gradio Client), with keyframe-motion fallback |
| **Image Engine** | Black Forest Labs FLUX.1-schnell |
| **Text Engine** | Qwen 2.5 7B Instruct |
| **Voice Engine** | edge-tts (Microsoft neural voices, 322 voices, free) |
| **Editing** | ffmpeg via `imageio-ffmpeg` (stitching, voiceover mux, music beds) |

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
