"use client"

import { useState } from "react"
import { Sparkles, Image as ImageIcon, Download, Maximize2, RefreshCw, Wand2, Layers, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PromptInput } from "@/components/shared/PromptInput"
import { LoadingOverlay } from "@/components/shared/LoadingOverlay"
import { EmptyState } from "@/components/shared/EmptyState"
import { IMAGE_PRESETS, IMAGE_STYLES } from "@/lib/constants"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { ImageGenerateResponse } from "@/types"

const HIGGSFIELD_IMAGE_MODELS = [
  { id: "flux", name: "FLUX.1 Schnell", badge: "4K", desc: "Ultra-crisp commercial photorealism and typography" },
  { id: "nano-banana", name: "Nano Banana Pro", badge: "FAST", desc: "Speed generation with high prompt adherence" },
  { id: "soul", name: "Soul 2.0 Photoreal", badge: "PEOPLE", desc: "Higgsfield specialized model for people & apparel" },
]

export default function ImageStudioPage() {
  const [selectedModel, setSelectedModel] = useState("flux")
  const [preset, setPreset] = useState(IMAGE_PRESETS[0])
  const [customWidth, setCustomWidth] = useState(1024)
  const [customHeight, setCustomHeight] = useState(1024)
  const [style, setStyle] = useState(IMAGE_STYLES[0])
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImageGenerateResponse | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Please enter a prompt")
    const w = preset.name === "Custom" ? customWidth : preset.width
    const h = preset.name === "Custom" ? customHeight : preset.height

    setIsLoading(true)
    try {
      const modelTag = HIGGSFIELD_IMAGE_MODELS.find((m) => m.id === selectedModel)?.name || ""
      const enrichedPrompt = `${prompt.trim()}, ${style.toLowerCase()} commercial aesthetic, shot on 35mm lens`

      const res = await api.generateImage({
        prompt: enrichedPrompt,
        negative_prompt: negativePrompt || undefined,
        width: w,
        height: h,
        style: style.toLowerCase().replace(/ /g, "_"),
      })
      setResult(res)
      toast.success("Image generated successfully with FLUX/Higgsfield engine!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate image")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result?.images?.[0]) return
    const imageData = result.images[0]
    const a = document.createElement("a")
    a.href = imageData
    a.download = `higgsfield-image-${Date.now()}.png`
    a.click()
  }

  const imageUrl = result?.images?.[0] || null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Image Studio</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
              FLUX.1 &amp; Nano Banana
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
              100% Free
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate 4K commercial marketing visuals, product banners, and campaign assets.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 relative">
        {isLoading && <LoadingOverlay message="Rendering high-resolution visuals..." />}

        {/* Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Model Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Image Model Architecture
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {HIGGSFIELD_IMAGE_MODELS.map((m) => {
                const isSelected = selectedModel === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
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

          <Card className="border-border/60 bg-card/40">
            <CardContent className="p-6 space-y-5">
              {/* Aspect Ratio Presets */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Aspect Ratio / Size</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {IMAGE_PRESETS.map((p) => {
                    const isSelected = preset.name === p.name
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setPreset(p)}
                        className={`p-2 rounded-lg border text-xs text-center transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-500/10 text-blue-400 font-semibold shadow-sm"
                            : "border-border/60 bg-card hover:border-border text-muted-foreground"
                        }`}
                      >
                        <div className="font-semibold text-[11px] truncate">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{p.width} &times; {p.height}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Style Presets */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Aesthetic Preset</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {IMAGE_STYLES.map((s) => {
                    const isSelected = style === s
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStyle(s)}
                        className={`p-2 rounded-lg border text-xs text-left truncate transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-500/10 text-blue-400 font-semibold"
                            : "border-border/60 bg-card hover:border-border text-muted-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Prompt Input */}
              <PromptInput
                label="Image Prompt"
                value={prompt}
                onChange={setPrompt}
                placeholder="e.g., Commercial perfume bottle floating in clear blue tropical ocean water with golden sunbeams and gentle bubbles..."
                suggestions={[
                  "luxury sports shoe floating on minimalist concrete plinth",
                  "matte black wireless headphones in studio darkroom with cyan backlighting",
                  "healthy green smoothie glass with fresh mint leaves and droplets",
                  "editorial portrait of model wearing high-fashion silver metallic jacket",
                ]}
              />

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 font-semibold transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Generate Visual (Free Model)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="h-full flex flex-col border-border/60 bg-card/40 overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Visual Canvas</CardTitle>
              {imageUrl && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs h-7 gap-1">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGenerate} className="text-xs h-7">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col items-center justify-center min-h-[420px]">
              {imageUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-border/80 shadow-2xl bg-black max-h-[500px] w-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={prompt} className="max-h-[500px] w-auto object-contain rounded-xl" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center line-clamp-2 px-2">
                    &ldquo;{prompt}&rdquo;
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={<ImageIcon className="h-10 w-10 text-blue-500/80" />}
                  title="No image generated yet"
                  description="Choose your model and preset on the left, then click Generate Visual to create 4K assets."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
