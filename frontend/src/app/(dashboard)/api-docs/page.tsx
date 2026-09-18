"use client"

import * as React from "react"
import { useState } from "react"
import { Terminal, Copy, Check, ExternalLink, Zap, Code, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/video/generate",
    title: "Generate Video",
    desc: "Synthesizes commercial video clips from text or reference frames using LTX-Video/Seedance.",
    snippet: `curl -X POST "http://localhost:8000/api/video/generate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Commercial perfume bottle floating in water ripples",
    "duration_seconds": 5,
    "style": "cinematic"
  }'`,
  },
  {
    method: "POST",
    path: "/api/photoshoot/generate",
    title: "Commercial Product Photoshoot",
    desc: "Produces 10-mode studio product shots with specialized commercial framing.",
    snippet: `curl -X POST "http://localhost:8000/api/photoshoot/generate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "studio_product",
    "prompt": "Matte black ceramic coffee tumbler on concrete countertop",
    "aspect_ratio": "1:1",
    "engine": "auto"
  }'`,
  },
  {
    method: "POST",
    path: "/api/image/generate",
    title: "Generate Image (FLUX.1 Schnell)",
    desc: "Creates 4K photorealistic marketing imagery with custom aspect ratios.",
    snippet: `curl -X POST "http://localhost:8000/api/image/generate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Futuristic running shoes on neon light podium",
    "width": 1024,
    "height": 1024,
    "style": "photorealistic"
  }'`,
  },
]

export default function ApiDocsPage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const copySnippet = (snippet: string, idx: number) => {
    navigator.clipboard.writeText(snippet)
    setCopiedIdx(idx)
    toast.success("cURL snippet copied to clipboard!")
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/20 via-card to-card p-6 md:p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
              Developer API
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
              100% Free &amp; Open
            </Badge>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Higgsfield Developer API
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Integrate video synthesis and 10-mode commercial product photoshoots directly into your custom applications and workflows.
          </p>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-muted-foreground uppercase tracking-wider">
          Available REST Endpoints
        </h2>

        <div className="space-y-4">
          {ENDPOINTS.map((ep, idx) => (
            <Card key={ep.path} className="border-border/60 bg-card/40 overflow-hidden">
              <CardHeader className="p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs text-foreground font-semibold">
                    {ep.path}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copySnippet(ep.snippet, idx)}
                  className="h-7 text-xs px-2 gap-1"
                >
                  {copiedIdx === idx ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy cURL</>}
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">{ep.desc}</p>
                <div className="rounded-lg bg-black/80 border border-border/60 p-3 overflow-x-auto">
                  <pre className="font-mono text-xs text-blue-300/90 leading-relaxed whitespace-pre">
                    {ep.snippet}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
