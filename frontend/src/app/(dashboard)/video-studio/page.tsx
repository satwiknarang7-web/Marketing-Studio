"use client"

import { useState, useRef } from "react"
import {
  Video,
  Download,
  Sparkles,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  X,
  SlidersHorizontal,
  Film,
  Camera,
  Play,
  RotateCcw,
  Zap,
  Mic,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptInput } from "@/components/shared/PromptInput"
import { LoadingOverlay } from "@/components/shared/LoadingOverlay"
import { VIDEO_STYLES } from "@/lib/constants"
import { api, BACKEND_URL } from "@/lib/api"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import type { VideoGenerateResponse } from "@/types"

const VIDEO_MODELS = [
  {
    id: "ltx-video",
    name: "LTX-Video Distilled",
    badge: "FREE",
    desc: "Lightricks real-time motion distillation — the engine actually wired up",
    available: true,
  },
  // Not connected yet. Listed so the gap is visible rather than implied.
  { id: "seedance", name: "Seedance 2.5", badge: "SOON", desc: "Not connected", available: false },
  { id: "kling", name: "Kling 1.5 HD", badge: "SOON", desc: "Not connected", available: false },
  { id: "hailuo", name: "Minimax Hailuo", badge: "SOON", desc: "Not connected", available: false },
  { id: "veo", name: "Veo 2", badge: "SOON", desc: "Not connected", available: false },
]

const CAMERA_MOVEMENTS = [
  { id: "static", label: "Static Tripod", icon: "📷" },
  { id: "pan_left", label: "Pan Left", icon: "⬅️" },
  { id: "pan_right", label: "Pan Right", icon: "➡️" },
  { id: "tilt_up", label: "Tilt Up", icon: "⬆️" },
  { id: "tilt_down", label: "Tilt Down", icon: "⬇️" },
  { id: "zoom_in", label: "Zoom In (Push)", icon: "🔍" },
  { id: "zoom_out", label: "Zoom Out (Pull)", icon: "🔎" },
  { id: "orbit_360", label: "Orbit 360°", icon: "🔄" },
  { id: "crane_up", label: "Crane Up", icon: "🏗️" },
  { id: "fpv_drone", label: "FPV Drone Flow", icon: "🛸" },
]

const LENS_PRESETS = [
  { id: "24mm", label: "24mm Wide Angle" },
  { id: "35mm", label: "35mm Classic Cinema" },
  { id: "50mm", label: "50mm Prime Natural" },
  { id: "85mm", label: "85mm Portrait Telephoto" },
]

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 Cinema" },
  { id: "9:16", label: "9:16 TikTok / Reels" },
  { id: "1:1", label: "1:1 Square" },
  { id: "4:5", label: "4:5 Social Feed" },
]

// Showcase gallery videos from our models
const SHOWCASE_VIDEOS = [
  {
    id: "showcase-1",
    title: "Locked Discount Promo — Kinetic Motion",
    prompt: "Kinetic typography glowing neon discount text with dynamic glitch transitions",
    model: "Seedance 2.5",
    videoUrl: "/videos/api-showcase.mp4",
    aspect: "16:9",
  },
  {
    id: "showcase-2",
    title: "Endless Visions — Multi-Camera Movement",
    prompt: "Split perspective dynamic camera movement tracking subject with smooth lighting shifts",
    model: "Restyle",
    videoUrl: "/videos/genjutsu-camera.mp4",
    aspect: "16:9",
  },
  {
    id: "showcase-3",
    title: "Wavu Music Motion Designer",
    prompt: "Stylized 3D character animation jumping to music beat with fluid vector waves",
    model: "Motion Designer V2",
    videoUrl: "/videos/motion-designer.mp4",
    aspect: "16:9",
  },
  {
    id: "showcase-4",
    title: "DTC Beauty Ad UGC Clip",
    prompt: "Close up portrait of model applying skincare cream in sunlight, natural movement",
    model: "LTX-Video Distilled",
    videoUrl: "/videos/ugc-demo.mp4",
    aspect: "9:16",
  },
  {
    id: "showcase-5",
    title: "Commercial Fashion Tryout",
    prompt: "Fashion model walking through studio lighting, silk jacket fluttering in slow motion",
    model: "Seedance 2.5",
    videoUrl: "/videos/fashion-tryout.mp4",
    aspect: "9:16",
  },
]

export default function VideoStudioPage() {
  const [selectedModel, setSelectedModel] = useState("ltx-video")
  const [mode, setMode] = useState<"text" | "image" | "genjutsu">("text")
  const [cameraMotion, setCameraMotion] = useState("zoom_in")
  const [lens, setLens] = useState("35mm")
  const [aspect, setAspect] = useState("16:9")
  const [duration, setDuration] = useState("5s")
  const [style, setStyle] = useState("Cinematic")
  const [prompt, setPrompt] = useState("")
  const [inputImage, setInputImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VideoGenerateResponse | null>(null)

  // Voiceover
  const [voScript, setVoScript] = useState("")
  const [voPreset, setVoPreset] = useState("brand_friendly")
  const [voFit, setVoFit] = useState<"pad" | "truncate">("pad")
  const [isVoLoading, setIsVoLoading] = useState(false)
  const [voicedUrl, setVoicedUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image file is too large (max 10MB)")
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setInputImage(reader.result as string)
        toast.success("Image uploaded! Video will animate this frame.")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() && !inputImage) {
      return toast.error("Please enter a prompt or upload a reference image")
    }

    setIsLoading(true)
    try {
      // Build enriched cinematic prompt incorporating camera motion and lens
      const motionLabel = CAMERA_MOVEMENTS.find((m) => m.id === cameraMotion)?.label || ""
      const lensLabel = LENS_PRESETS.find((l) => l.id === lens)?.label || ""
      const enrichedPrompt = `${prompt.trim()}, ${motionLabel} camera movement, filmed on ${lensLabel}, ${style.toLowerCase()} lighting`

      const res = await api.generateVideo({
        prompt: enrichedPrompt,
        duration_seconds: parseInt(duration.replace("s", "")),
        style: style.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_"),
        image_data: inputImage || undefined,
        camera_movement: cameraMotion,
      })
      setResult(res)
      setVoicedUrl(null)
      toast.success(
        res.engine_used === "ltx-video"
          ? "Video generated with LTX-Video."
          : "LTX-Video was unavailable — built from generated keyframes with a camera move instead."
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate video")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddVoiceover = async () => {
    if (!result) return
    if (!voScript.trim()) return toast.error("Write the voiceover script first")

    setIsVoLoading(true)
    try {
      const vo = await api.generateVoiceover({ script: voScript, preset_id: voPreset })
      const merged = await api.attachVoiceover({
        video_url: result.video_url,
        audio_url: vo.audio_url,
        fit: voFit,
      })
      setVoicedUrl(merged.video_url)
      toast.success(
        voFit === "pad"
          ? "Voiceover added. Last frame held so the full script is heard."
          : "Voiceover added, trimmed to the shorter track."
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add voiceover")
    } finally {
      setIsVoLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Video Studio</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
              Director Camera Controls
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
              100% Free
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Create commercial video ads with real camera motion paths, driven by free open models.
          </p>
        </div>

        {/* Quick Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-card border border-border/60">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              mode === "text"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Text to Video
          </button>
          <button
            type="button"
            onClick={() => setMode("image")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              mode === "image"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Image to Video
          </button>
          <button
            type="button"
            onClick={() => setMode("genjutsu")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              mode === "genjutsu"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Genjutsu (V2V)
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {isLoading && <LoadingOverlay message="Synthesizing video motion & camera physics..." />}

        {/* Left Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Model Selector Bar */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Video Model Engine
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VIDEO_MODELS.map((m) => {
                const isSelected = selectedModel === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!m.available}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !m.available
                        ? "border-border/40 bg-card/20 opacity-40 cursor-not-allowed"
                        : isSelected
                        ? "border-blue-600 bg-blue-500/10 shadow-sm"
                        : "border-border/60 hover:border-border bg-card/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs">{m.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{m.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reference Image / Frame (If Image or Genjutsu Mode) */}
          {(mode === "image" || mode === "genjutsu") && (
            <Card className="border-border/60 bg-card/40">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">
                    {mode === "image" ? "First Frame Reference (Image-to-Video)" : "Source Video Reference (Genjutsu)"}
                  </Label>
                  {inputImage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputImage(null)}
                      className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  )}
                </div>

                {inputImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-border h-40 bg-black flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={inputImage} alt="Input frame" className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/80 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-muted/10 hover:bg-muted/20"
                  >
                    <Upload className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                    <p className="text-xs font-medium text-foreground">Click to upload reference image</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, WebP up to 10MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </CardContent>
            </Card>
          )}

          {/* Camera Controls & Optics */}
          <Card className="border-border/60 bg-card/40">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4 text-blue-400" />
                Director Camera Movement &amp; Optics
              </CardTitle>
              <CardDescription className="text-xs">
                Calibrate virtual camera path and lens physics for the scene
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              {/* Camera Movement Grid */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Camera Movement</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {CAMERA_MOVEMENTS.map((cm) => {
                    const isSelected = cameraMotion === cm.id
                    return (
                      <button
                        key={cm.id}
                        type="button"
                        onClick={() => setCameraMotion(cm.id)}
                        className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-500/10 text-blue-400 font-semibold shadow-sm"
                            : "border-border/60 bg-card hover:border-border text-muted-foreground"
                        }`}
                      >
                        <span className="text-base">{cm.icon}</span>
                        <span className="text-[10px] text-center leading-tight truncate w-full">{cm.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Lens & Aspect Ratio Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Lens Focal Length</Label>
                  <Select value={lens} onValueChange={setLens}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LENS_PRESETS.map((l) => (
                        <SelectItem key={l.id} value={l.id} className="text-xs">
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
                  <Select value={aspect} onValueChange={setAspect}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((a) => (
                        <SelectItem key={a.id} value={a.id} className="text-xs">
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3s" className="text-xs">3 Seconds</SelectItem>
                      <SelectItem value="5s" className="text-xs">5 Seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Input */}
          <PromptInput
            label="Visual Scene & Action Description"
            value={prompt}
            onChange={setPrompt}
            placeholder="e.g., Luxury watch lying on black volcanic rock, cinematic soft lighting, water mist drifting across dial..."
            suggestions={[
              "Perfume bottle hovering over water ripples, slow motion droplets",
              "Cyberpunk street at dusk with neon reflections on wet asphalt",
              "Model wearing satin trenchcoat turning to camera in golden hour",
              "Futuristic sports car accelerating through neon tunnel, camera chase",
            ]}
          />

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || (!prompt.trim() && !inputImage)}
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 font-semibold transition-all"
          >
            <Sparkles className="mr-2 h-5 w-5" /> Generate Video (Free Model)
          </Button>
        </div>

        {/* Right Output Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="h-full flex flex-col border-border/60 bg-card/40 overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Active Player</CardTitle>
                <CardDescription className="text-xs">
                  {result ? "Generated output ready" : "Previewing sample video"}
                </CardDescription>
              </div>
              {result && (
                <Badge
                  variant="outline"
                  className={
                    result.engine_used === "ltx-video"
                      ? "border-blue-500/30 text-blue-400 text-[10px]"
                      : "border-amber-500/30 text-amber-400 text-[10px]"
                  }
                >
                  {result.engine_used === "ltx-video" ? "AI video" : "Keyframe motion"}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col items-center justify-center">
              {result ? (
                <div className="w-full space-y-3">
                  <div className="rounded-xl overflow-hidden bg-black aspect-video border border-border/80 shadow-lg">
                    <video
                      src={`${BACKEND_URL}${result.video_url}`}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                      <a href={`${BACKEND_URL}${result.video_url}`} download target="_blank" rel="noreferrer">
                        <Download className="mr-1.5 h-3.5 w-3.5" /> Download MP4
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerate} className="text-xs">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center">
                    {result.engine_used === "ltx-video"
                      ? "Generated by LTX-Video diffusion."
                      : "LTX-Video was unavailable. This clip is generated stills crossfaded with a camera move — not AI-generated motion."}
                  </p>

                  {/* Voiceover */}
                  <div className="pt-3 border-t border-border/40 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Mic className="h-3.5 w-3.5 text-blue-400" />
                      <Label className="text-xs font-semibold">Add voiceover</Label>
                    </div>

                    <Textarea
                      value={voScript}
                      onChange={(e) => setVoScript(e.target.value)}
                      rows={3}
                      placeholder="Script to be read over this clip..."
                      className="text-xs resize-none"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Select value={voPreset} onValueChange={setVoPreset}>
                        <SelectTrigger className="h-8 text-[11px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brand_friendly" className="text-xs">Friendly Brand</SelectItem>
                          <SelectItem value="narrator_deep" className="text-xs">Deep Narrator</SelectItem>
                          <SelectItem value="ad_energetic" className="text-xs">High-Energy Ad</SelectItem>
                          <SelectItem value="calm_luxury" className="text-xs">Calm &amp; Premium</SelectItem>
                          <SelectItem value="uk_professional" className="text-xs">British Professional</SelectItem>
                          <SelectItem value="au_casual" className="text-xs">Australian Casual</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={voFit} onValueChange={(v) => setVoFit(v as "pad" | "truncate")}>
                        <SelectTrigger className="h-8 text-[11px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pad" className="text-xs">Hold last frame</SelectItem>
                          <SelectItem value="truncate" className="text-xs">Trim to shortest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleAddVoiceover}
                      disabled={isVoLoading || !voScript.trim()}
                      size="sm"
                      className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      {isVoLoading ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Adding voiceover...
                        </>
                      ) : (
                        <>
                          <Mic className="mr-1.5 h-3.5 w-3.5" /> Generate &amp; attach
                        </>
                      )}
                    </Button>

                    {voicedUrl && (
                      <div className="space-y-2 pt-1">
                        <video
                          src={`${BACKEND_URL}${voicedUrl}`}
                          controls
                          className="w-full rounded-lg border border-blue-500/30 bg-black"
                        />
                        <Button asChild variant="outline" size="sm" className="w-full text-xs">
                          <a href={`${BACKEND_URL}${voicedUrl}`} download target="_blank" rel="noreferrer">
                            <Download className="mr-1.5 h-3.5 w-3.5" /> Download with voiceover
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="rounded-xl overflow-hidden bg-black aspect-video border border-border/80 shadow-lg relative group">
                    <video
                      src="/videos/genjutsu-camera.mp4"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded text-blue-400 border border-blue-500/30 font-semibold">
                        SAMPLE FEED
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Camera movement demo
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Community / Showcase Video Feed */}
      <div className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Film className="h-4 w-4 text-blue-500" />
              Generated Video Showcase
            </h2>
            <p className="text-xs text-muted-foreground">
              Commercial video generations produced with our open-source models
            </p>
          </div>
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
            Auto-Looping
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHOWCASE_VIDEOS.map((v) => (
            <div
              key={v.id}
              className="rounded-xl border border-border/60 bg-card/40 overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-black overflow-hidden">
                <video
                  src={v.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-white border border-white/20">
                    {v.model}
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-2">
                <div>
                  <h4 className="font-bold text-xs text-foreground group-hover:text-blue-400 transition-colors">
                    {v.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {v.prompt}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                  <Button asChild size="sm" variant="ghost" className="h-7 text-xs px-2 ml-auto">
                    <a href={v.videoUrl} download target="_blank" rel="noreferrer">
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
