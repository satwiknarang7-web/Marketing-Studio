"use client"

import { useState, useRef } from "react"
import { Camera, Sparkles, Download, Maximize2, RefreshCw, Upload, X, Layers, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PromptInput } from "@/components/shared/PromptInput"
import { LoadingOverlay } from "@/components/shared/LoadingOverlay"
import { EmptyState } from "@/components/shared/EmptyState"
import { PHOTOSHOOT_MODES_LIST } from "@/lib/constants"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { motion } from "framer-motion"
import type { PhotoshootGenerateResponse } from "@/types"

export default function ProductPhotoshootPage() {
  const [selectedMode, setSelectedMode] = useState(PHOTOSHOOT_MODES_LIST[0])
  const [prompt, setPrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [engine, setEngine] = useState<"auto" | "higgsfield" | "huggingface">("auto")
  const [productImage, setProductImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PhotoshootGenerateResponse | null>(null)
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
        setProductImage(reader.result as string)
        toast.success("Product image uploaded!")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() && !productImage) {
      return toast.error("Please enter a product description or upload an image")
    }

    setIsLoading(true)
    try {
      const res = await api.generatePhotoshoot({
        mode: selectedMode.id,
        prompt: prompt || `A premium commercial photoshoot of the product`,
        image_data: productImage || undefined,
        aspect_ratio: selectedMode.aspect || aspectRatio,
        count: 1,
        engine,
      })
      setResult(res)
      toast.success("Photoshoot generated successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Photoshoot generation failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (imgUrl: string) => {
    const a = document.createElement("a")
    a.href = imgUrl
    a.download = `photoshoot-${selectedMode.id}-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Product Photoshoot</h1>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Higgsfield Architecture
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Studio-grade commercial product imagery across 10 specialized advertising modes
          </p>
        </div>

        {/* Engine Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg border self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setEngine("auto")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              engine === "auto" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Auto Hybrid
          </button>
          <button
            type="button"
            onClick={() => setEngine("higgsfield")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              engine === "higgsfield" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Higgsfield CLI
          </button>
          <button
            type="button"
            onClick={() => setEngine("huggingface")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              engine === "huggingface" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            FLUX Schnell
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 relative">
        {isLoading && <LoadingOverlay message="Composing your commercial photoshoot..." />}

        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                Select Photoshoot Mode (10 Commercial Modes)
              </CardTitle>
              <CardDescription>
                Choose the visual framing style calibrated for your target channel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              {/* 10 Modes Grid */}
              <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {PHOTOSHOOT_MODES_LIST.map((m) => {
                  const isSelected = selectedMode.id === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMode(m)
                        setAspectRatio(m.aspect)
                      }}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? "border-blue-600 bg-blue-500/10 shadow-sm"
                          : "border-border hover:border-muted-foreground/40 bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-xs leading-tight">{m.label}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                          {m.tag}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{m.description}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Optional Product Image Upload */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center justify-between">
                  <span>Product Reference Photo (Optional)</span>
                  {productImage && (
                    <button
                      type="button"
                      onClick={() => setProductImage(null)}
                      className="text-xs text-destructive flex items-center gap-1 hover:underline"
                    >
                      <X className="h-3 w-3" /> Remove image
                    </button>
                  )}
                </Label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {productImage ? (
                  <div className="relative rounded-lg border p-2 bg-muted/40 flex items-center gap-3">
                    <img
                      src={productImage}
                      alt="Source Product"
                      className="h-16 w-16 object-cover rounded-md border"
                    />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">Product reference loaded</p>
                      <p>AI will place this product inside the {selectedMode.label} setup</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-10 border-dashed text-xs text-muted-foreground"
                  >
                    <Upload className="h-3.5 w-3.5 mr-2" /> Upload product photo to place in scene
                  </Button>
                )}
              </div>

              {/* Prompt Input */}
              <PromptInput
                label="Product & Scene Details"
                value={prompt}
                onChange={setPrompt}
                placeholder="e.g. Matte black ceramic coffee tumbler on a concrete countertop with soft sunlight..."
                suggestions={[
                  "luxury perfume bottle with water splash",
                  "sneaker on minimal pastel podium",
                  "skincare dropper held by hand",
                  "organic energy drink in outdoor gym",
                ]}
              />

              <Button
                onClick={handleGenerate}
                disabled={isLoading || (!prompt.trim() && !productImage)}
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 font-semibold transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Generate Photoshoot
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-6">
          {result && result.images.length > 0 ? (
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{selectedMode.label}</span>
                    <Badge variant="outline" className="text-xs font-normal">
                      {result.engine_used}
                    </Badge>
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" /> Re-roll
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownload(result.images[0])}
                  >
                    <Download className="mr-2 h-3.5 w-3.5" /> Save Image
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-6 flex flex-col items-center justify-center bg-muted/20">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-lg overflow-hidden border shadow-lg max-h-[550px] max-w-full"
                >
                  <img
                    src={result.images[0]}
                    alt="Generated Photoshoot"
                    className="max-h-[500px] w-auto object-contain"
                  />
                </motion.div>

                <div className="mt-4 p-3 rounded-lg bg-card border text-xs text-muted-foreground w-full">
                  <span className="font-semibold text-foreground">Enhanced Prompt Applied: </span>
                  <span className="line-clamp-2">{result.enhanced_prompt}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[420px]">
              <EmptyState
                icon={<Camera className="h-8 w-8" />}
                title="Your Studio is Set"
                description="Pick one of the 10 commercial photoshoot modes on the left, describe your product, and generate studio-grade imagery."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
