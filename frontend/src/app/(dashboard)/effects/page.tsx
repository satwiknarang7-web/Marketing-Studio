"use client"

import * as React from "react"
import { useState } from "react"
import { Sparkles, Wand2, Play, Download, Zap, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const EFFECTS_LIST = [
  { id: "kinetic_zoom", name: "Kinetic Velocity Zoom", badge: "POPULAR", desc: "Dynamic speed ramping with motion blur transitions", video: "/videos/api-showcase.mp4" },
  { id: "neon_glow", name: "Cyberpunk Neon Glow", badge: "FREE", desc: "Edge-detection bioluminescent lighting effects", video: "/videos/motion-designer.mp4" },
  { id: "camera_reframe", name: "360° Camera Orbit", badge: "PRO", desc: "Reconstructs depth and rotates camera around center point", video: "/videos/genjutsu-camera.mp4" },
  { id: "slowmo_flow", name: "Ultra Slow-Mo 120 FPS", badge: "FREE", desc: "Fluid optical flow interpolation for silky slow motion", video: "/videos/fashion-tryout.mp4" },
  { id: "cinematic_grain", name: "35mm Grain & Color Grade", badge: "FREE", desc: "Organic film stock grain with teal and orange LUT", video: "/videos/ugc-demo.mp4" },
]

export default function EffectsPage() {
  const [selectedEffect, setSelectedEffect] = useState(EFFECTS_LIST[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">AI Effects Studio</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
              Kinetic &amp; Optical Shaders
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
              100% Free
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Apply signature Higgsfield motion effects, camera zooms, and stylized neural shaders to your video clips.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Effects Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EFFECTS_LIST.map((eff) => {
              const isSelected = selectedEffect.id === eff.id
              return (
                <button
                  key={eff.id}
                  type="button"
                  onClick={() => {
                    setSelectedEffect(eff)
                    toast.info(`Switched effect to ${eff.name}`)
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-500/10 shadow-sm"
                      : "border-border/60 hover:border-border bg-card/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-foreground">{eff.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold">
                      {eff.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{eff.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Live Preview Player (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="border-border/60 bg-card/40 overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>{selectedEffect.name} Preview</span>
                <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">
                  Live Loop
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="rounded-xl overflow-hidden bg-black aspect-video border border-border/80 shadow-2xl">
                <video
                  key={selectedEffect.video}
                  src={selectedEffect.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-2">
                <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9 shadow-md shadow-blue-500/20">
                  <a href={selectedEffect.video} download target="_blank" rel="noreferrer">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download Effect Clip
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
