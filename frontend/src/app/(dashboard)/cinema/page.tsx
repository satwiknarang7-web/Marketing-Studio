"use client"

import * as React from "react"
import { useState } from "react"
import { Film, Camera, Video, Sparkles, Sliders, Play, RotateCcw, Download, Eye, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { PromptInput } from "@/components/shared/PromptInput"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { VideoGenerateResponse } from "@/types"

const VIRTUAL_CAMERAS = [
  { id: "arri", name: "ARRI Alexa 35", desc: "Super 35 cinema sensor with 17 stops dynamic range" },
  { id: "red", name: "RED V-Raptor XL", desc: "8K large format with ultra-high frame rate capture" },
  { id: "sony", name: "Sony Venice 2", desc: "Dual native ISO with rich color science" },
]

const LENSES = [
  { id: "anamorphic_40", name: "Cooke Anamorphic /i 40mm", desc: "Classic 2x oval bokeh and horizontal blue flare streaks" },
  { id: "prime_35", name: "Zeiss Supreme Prime 35mm", desc: "Sharp modern clinical cinema optics" },
  { id: "vintage_50", name: "Canon K-35 Vintage 50mm", desc: "Warm organic skin tones and vintage falloff" },
  { id: "tele_85", name: "ARRI Signature Prime 85mm", desc: "Creamy background separation and isolation" },
]

const CAMERA_STACKS = [
  { id: "dolly_zoom", label: "Dolly Zoom (Vertigo Effect)", icon: "🌀" },
  { id: "whip_pan", label: "Fast Whip Pan", icon: "⚡" },
  { id: "crane_tilt", label: "Crane Descent + Tilt Up", icon: "🏗️" },
  { id: "tracking_orbit", label: "360° Low Orbit Tracking", icon: "🔄" },
  { id: "fpv_dive", label: "FPV Architectural Dive", icon: "🛸" },
]

export default function CinemaStudioPage() {
  const [cameraBody, setCameraBody] = useState("arri")
  const [lens, setLens] = useState("anamorphic_40")
  const [cameraStack, setCameraStack] = useState("tracking_orbit")
  const [depthOfField, setDepthOfField] = useState([1.8])
  const [shutterAngle, setShutterAngle] = useState("180")
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VideoGenerateResponse | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Please enter a scene description")

    setIsLoading(true)
    try {
      const cam = VIRTUAL_CAMERAS.find((c) => c.id === cameraBody)?.name || ""
      const l = LENSES.find((x) => x.id === lens)?.name || ""
      const stack = CAMERA_STACKS.find((s) => s.id === cameraStack)?.label || ""

      const cinematicPrompt = `${prompt.trim()}, shot on ${cam}, lens: ${l}, aperture f/${depthOfField[0]}, ${stack} camera motion, cinematic color grading, 24fps motion blur`

      const res = await api.generateVideo({
        prompt: cinematicPrompt,
        duration_seconds: 5,
        style: "cinematic",
      })
      setResult(res)
      toast.success("Cinema sequence synthesized successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate sequence")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Cinema Studio</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
              Optical Physics &amp; Lenses
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
              Director Level
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Simulate physical cinema camera bodies, anamorphic lenses, depth-of-field, and complex camera movements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Virtual Camera Bodies */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Virtual Camera Body
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {VIRTUAL_CAMERAS.map((cam) => {
                const isSelected = cameraBody === cam.id
                return (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => setCameraBody(cam.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-500/10 shadow-sm"
                        : "border-border/60 hover:border-border bg-card/60"
                    }`}
                  >
                    <span className="font-bold text-xs block text-foreground">{cam.name}</span>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{cam.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lens & Optical Physics */}
          <Card className="border-border/60 bg-card/40">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4 text-blue-400" />
                Optical Glass &amp; Aperture (f-stop)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cinema Lens Model</Label>
                <Select value={lens} onValueChange={setLens}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENSES.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="text-xs">
                        {l.name} — {l.desc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Aperture slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Aperture / Shallow Depth of Field</span>
                  <span className="font-mono text-blue-400 font-bold">f/{depthOfField[0]}</span>
                </div>
                <Slider
                  value={depthOfField}
                  min={1.2}
                  max={8.0}
                  step={0.1}
                  onValueChange={setDepthOfField}
                  className="py-1"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Ultra Shallow (f/1.2)</span>
                  <span>Deep Focus (f/8.0)</span>
                </div>
              </div>

              {/* Camera Movement Stack */}
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs text-muted-foreground">Stacked Dynamic Motion Path</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CAMERA_STACKS.map((cs) => {
                    const isSelected = cameraStack === cs.id
                    return (
                      <button
                        key={cs.id}
                        type="button"
                        onClick={() => setCameraStack(cs.id)}
                        className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-500/10 text-blue-400 font-semibold"
                            : "border-border/60 bg-card hover:border-border text-muted-foreground"
                        }`}
                      >
                        <span className="text-sm mr-1.5">{cs.icon}</span>
                        <span className="text-[11px] leading-tight">{cs.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt */}
          <PromptInput
            label="Director Scene Description"
            value={prompt}
            onChange={setPrompt}
            placeholder="e.g., A protagonist walking through neon rain in Tokyo, intense gaze, cinematic bokeh reflections..."
            suggestions={[
              "Dramatic hero shot of astronaut taking helmet off on mars",
              "Slow tracking shot across antique mahogany library at golden hour",
              "Vintage sports car drifting around coastal mountain curve",
            ]}
          />

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 font-semibold transition-all"
          >
            <Sparkles className="mr-2 h-5 w-5" /> Generate Cinema Sequence
          </Button>
        </div>

        {/* Right Output Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="h-full flex flex-col border-border/60 bg-card/40 overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-bold">Director Viewfinder</CardTitle>
              <CardDescription className="text-xs">
                {result ? "Cinema shot synthesized" : "Live camera physics preview"}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col items-center justify-center">
              {result ? (
                <div className="w-full space-y-3">
                  <div className="rounded-xl overflow-hidden bg-black aspect-video border border-border/80 shadow-2xl">
                    <video
                      src={`http://localhost:8000${result.video_url}`}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs">
                    <a href={`http://localhost:8000${result.video_url}`} download target="_blank" rel="noreferrer">
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download Cinema DCI 4K MP4
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="rounded-xl overflow-hidden bg-black aspect-video border border-border/80 shadow-2xl relative">
                    <video
                      src="/videos/genjutsu-camera.mp4"
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-blue-400 border border-blue-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                      REC 24 FPS • 35MM
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Sample: 360° Anamorphic Tracking Shot
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
