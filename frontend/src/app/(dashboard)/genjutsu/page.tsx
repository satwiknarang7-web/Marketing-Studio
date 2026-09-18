"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Wand2, Upload, Sparkles, Video, Download, RefreshCw, Layers, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { PromptInput } from "@/components/shared/PromptInput"
import { LoadingOverlay } from "@/components/shared/LoadingOverlay"
import { api, BACKEND_URL } from "@/lib/api"
import { toast } from "sonner"
import type { VideoGenerateResponse } from "@/types"

const GENJUTSU_TRANSFORMS = [
  { id: "camera_reframe", label: "Camera Reframe & Orbit", desc: "Keep character, rebuild camera angle and motion" },
  { id: "world_morph", label: "World & Environment Morph", desc: "Keep motion, swap the background scene completely" },
  { id: "anime_transfer", label: "Cinematic Anime Style Transfer", desc: "Transform live action footage into high-end animation" },
  { id: "cyberpunk_neon", label: "Cyberpunk Cybernetic Overhaul", desc: "Add neon reflections, holograms, and futurism" },
]

export default function GenjutsuPage() {
  const [selectedTransform, setSelectedTransform] = useState("camera_reframe")
  const [prompt, setPrompt] = useState("")
  const [inputImage, setInputImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VideoGenerateResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setInputImage(reader.result as string)
        toast.success("Source media uploaded into Genjutsu engine!")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() && !inputImage) {
      return toast.error("Please enter a transform prompt or upload source footage")
    }

    setIsLoading(true)
    try {
      const transformLabel = GENJUTSU_TRANSFORMS.find((t) => t.id === selectedTransform)?.label || ""
      const fullPrompt = `Higgsfield Genjutsu transformation: ${transformLabel}, ${prompt || "cinematic style metamorphosis"}`

      const res = await api.generateVideo({
        prompt: fullPrompt,
        duration_seconds: 5,
        style: "cinematic",
        image_data: inputImage || undefined,
        camera_movement: selectedTransform,
      })
      setResult(res)
      toast.success(
        res.engine_used === "ltx-video"
          ? "Transformation generated with LTX-Video."
          : "LTX-Video was unavailable — built from generated keyframes with a camera move."
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to synthesize vision")
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
            <h1 className="text-3xl font-extrabold tracking-tight">Higgsfield Genjutsu</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
              Video-to-Video Engine
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
              100% Free
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            One upload in. Endless new visions out. Transform character motion, environments, and camera angles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {isLoading && <LoadingOverlay message="Executing Genjutsu neural metamorphosis..." />}

        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Transform Presets */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Transformation Mode
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GENJUTSU_TRANSFORMS.map((t) => {
                const isSelected = selectedTransform === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTransform(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-500/10 shadow-sm"
                        : "border-border/60 hover:border-border bg-card/60"
                    }`}
                  >
                    <span className="font-bold text-xs text-foreground block">{t.label}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{t.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Source Input */}
          <Card className="border-border/60 bg-card/40">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Source Frame / Media (INPUT)</Label>
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
                <div className="relative rounded-lg overflow-hidden border border-border h-44 bg-black flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={inputImage} alt="Input frame" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/80 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-muted/10 hover:bg-muted/20"
                >
                  <Upload className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <p className="text-xs font-medium text-foreground">Upload reference video frame</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Drag &amp; drop PNG, JPG, or MP4 frame</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </CardContent>
          </Card>

          {/* Prompt */}
          <PromptInput
            label="Vision Mutation Prompt"
            value={prompt}
            onChange={setPrompt}
            placeholder="e.g., Change lighting to dramatic sunset, add rain reflections and futuristic cybernetic eyes..."
            suggestions={[
              "Transform background into lush tropical rainforest with waterfall mist",
              "Render character as anime protagonist with glowing aura",
              "Change daytime sunny scene into misty cyberpunk midnight",
            ]}
          />

          <Button
            onClick={handleGenerate}
            disabled={isLoading || (!prompt.trim() && !inputImage)}
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 font-semibold transition-all"
          >
            <Sparkles className="mr-2 h-5 w-5" /> Morph &amp; Generate Vision
          </Button>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="h-full flex flex-col border-border/60 bg-card/40 overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Genjutsu Output</span>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  CAMERA MOVEMENT
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col items-center justify-center">
              {result ? (
                <div className="w-full space-y-3">
                  <div className="rounded-xl overflow-hidden bg-black aspect-video border border-border/80 shadow-2xl">
                    <video
                      src={`${BACKEND_URL}${result.video_url}`}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full text-xs">
                    <a href={`${BACKEND_URL}${result.video_url}`} download target="_blank" rel="noreferrer">
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download Mutated Video
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
                    <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/70 px-2 py-0.5 rounded text-white border border-white/20">
                          KEEP 📷
                        </span>
                        <span className="text-[10px] font-mono bg-blue-600/90 px-2 py-0.5 rounded text-white font-semibold">
                          OUTPUT
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold bg-black/70 px-2 py-0.5 rounded text-zinc-300">
                          INPUT
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Sample: One Upload In. Endless New Visions Out.
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
