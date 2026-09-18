"use client"

import * as React from "react"
import { useState } from "react"
import { Sparkles, Zap, Film, Check, ExternalLink, MessageSquare, ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function ChatGPTPluginPage() {
  const [prompt, setPrompt] = useState("Generate a 15-second viral TikTok script and video prompt for an organic iced matcha brand")
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInstalled, setIsInstalled] = useState(true)

  const handleRunPrompt = async () => {
    if (!prompt.trim()) return
    setIsLoading(true)
    try {
      const res = await api.generateText({
        template: "social_post",
        prompt: prompt,
        tone: "creative",
        length: "medium",
        variations_count: 1,
      })
      setResponse(res.contents[0])
      toast.success("Plugin prompt executed successfully!")
    } catch (err) {
      toast.error("Failed to run plugin prompt")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/20 via-card to-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
              Official Plugin
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
              100% Free
            </Badge>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Studio in ChatGPT
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Directly invoke 70+ video, photoshoot, and image generation models inside your ChatGPT conversations with zero setup friction.
          </p>
        </div>

        <Button
          onClick={() => {
            setIsInstalled(!isInstalled)
            toast.success(isInstalled ? "Plugin uninstalled" : "Plugin installed and active!")
          }}
          className={`${
            isInstalled
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
              : "bg-muted text-foreground"
          } font-semibold text-sm h-10 px-5 rounded-full`}
        >
          {isInstalled ? <><Check className="mr-2 h-4 w-4" /> Plugin Connected</> : "+ Connect Plugin"}
        </Button>
      </div>

      {/* Interactive Simulation & Phone Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Prompt Simulation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/60 bg-card/40">
            <CardHeader className="p-4 pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                Try ChatGPT Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] text-sm bg-muted/20"
                  placeholder="Ask ChatGPT with studio plugin..."
                />
              </div>

              <Button
                onClick={handleRunPrompt}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10"
              >
                {isLoading ? "Executing with Qwen2.5 Engine..." : "Execute Plugin Workflow"}
              </Button>

              {response && (
                <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                    ChatGPT Output via Studio Engine
                  </span>
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                    {response}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Phone Video Mockup (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl border border-border/60 bg-card/40">
          <div className="w-56 aspect-[9/16] rounded-2xl overflow-hidden border-2 border-border/80 shadow-2xl bg-black relative">
            <video
              src="/videos/ugc-demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 right-3 bg-black/70 backdrop-blur-sm p-2 rounded-lg border border-white/20">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                ⚡ UGC Generator
              </div>
              <p className="text-[9px] text-zinc-300 truncate mt-0.5">Prompt: Organic matcha tea promo</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Real-time UGC video delivered inside ChatGPT
          </p>
        </div>
      </div>
    </div>
  )
}
