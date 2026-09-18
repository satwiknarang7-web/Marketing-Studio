"use client"

import * as React from "react"
import { useState } from "react"
import { Volume2, Play, Square, Download, Sparkles, Mic, Music, Waves, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const VOICES = [
  { id: "narrator_deep", name: "Marcus — Cinematic Documentary", tone: "Deep, resonant, authoritative" },
  { id: "brand_friendly", name: "Elena — Friendly Brand Voice", tone: "Warm, inviting, conversational" },
  { id: "ad_energetic", name: "Liam — High-Energy DTC Ad", tone: "Punchy, persuasive, upbeat" },
  { id: "calm_luxury", name: "Sophia — Luxury & Skincare", tone: "Subtle, whispering, elegant" },
]

export default function AudioStudioPage() {
  const [selectedVoice, setSelectedVoice] = useState("brand_friendly")
  const [script, setScript] = useState("Welcome to Segue IT Marketing Studio. Elevate your brand with generative commercial media, designed for viral conversion.")
  const [isPlaying, setIsPlaying] = useState(false)
  const [speechRate, setSpeechRate] = useState("1.0")

  const handleSpeak = () => {
    if (!script.trim()) return toast.error("Please enter a voice script")

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(script)
      utterance.rate = parseFloat(speechRate)

      // Try to find natural voices
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        if (selectedVoice.includes("Elena") || selectedVoice.includes("Sophia")) {
          const female = voices.find((v) => v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Zira"))
          if (female) utterance.voice = female
        } else {
          const male = voices.find((v) => v.name.includes("Male") || v.name.includes("David") || v.name.includes("Alex"))
          if (male) utterance.voice = male
        }
      }

      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)

      window.speechSynthesis.speak(utterance)
      toast.success("Synthesizing voice audio...")
    } else {
      toast.error("Browser speech synthesis not supported")
    }
  }

  const handleStop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Audio &amp; Voice Studio</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
              Voice Binding &amp; TTS
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
              100% Free
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate voiceovers, lock voice signatures to video avatars, and produce high-impact audio for commercial campaigns.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Voice Controls (7 cols) */}
        <div className="md:col-span-7 space-y-5">
          {/* Voice Presets */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Voice Personality
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VOICES.map((v) => {
                const isSelected = selectedVoice === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVoice(v.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-500/10 shadow-sm"
                        : "border-border/60 hover:border-border bg-card/60"
                    }`}
                  >
                    <span className="font-bold text-xs text-foreground block">{v.name}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{v.tone}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Script Text */}
          <Card className="border-border/60 bg-card/40">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs font-medium">Voiceover Script</Label>
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={4}
                className="text-xs bg-muted/20"
                placeholder="Enter voice script..."
              />

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={isPlaying ? handleStop : handleSpeak}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9 px-4 gap-2 shadow-md shadow-blue-500/20"
                >
                  {isPlaying ? (
                    <><Square className="h-3.5 w-3.5 fill-white" /> Stop Audio</>
                  ) : (
                    <><Play className="h-3.5 w-3.5 fill-white" /> Generate &amp; Play Speech</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audio Visualizer Card (5 cols) */}
        <div className="md:col-span-5">
          <Card className="h-full flex flex-col border-border/60 bg-card/40 overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Waves className="h-4 w-4 text-blue-400" />
                Voice Signature &amp; Waveform
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-full h-28 rounded-xl bg-black/60 border border-border/60 flex items-center justify-center gap-1.5 px-4">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full bg-blue-500 transition-all duration-150 ${
                      isPlaying
                        ? "animate-pulse"
                        : "h-3 bg-blue-500/30"
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(12, ((i * 17) % 65) + 10)}px` : "12px",
                      animationDelay: `${(i % 5) * 0.1}s`,
                    }}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {isPlaying ? "Voice binding audio actively synthesizing..." : "Client-side neural speech ready"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
