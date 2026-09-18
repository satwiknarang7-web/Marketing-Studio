"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Volume2, Download, Sparkles, Mic, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api, BACKEND_URL } from "@/lib/api"
import { toast } from "sonner"
import type { VoicePreset, CatalogueVoice, VoiceoverGenerateResponse } from "@/types"

const SPEEDS = [
  { value: "-15%", label: "Slow" },
  { value: "-8%", label: "Relaxed" },
  { value: "default", label: "Preset default" },
  { value: "+10%", label: "Brisk" },
  { value: "+20%", label: "Fast" },
]

export default function AudioStudioPage() {
  const [presets, setPresets] = useState<VoicePreset[]>([])
  const [catalogue, setCatalogue] = useState<CatalogueVoice[]>([])
  const [selectedPreset, setSelectedPreset] = useState("brand_friendly")
  const [overrideVoice, setOverrideVoice] = useState("preset")
  const [rate, setRate] = useState("default")
  const [script, setScript] = useState(
    "Introducing Segue IT Marketing Studio. Create commercial video, product photography and campaign copy in minutes, not weeks."
  )
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VoiceoverGenerateResponse | null>(null)

  useEffect(() => {
    api.getVoicePresets().then(setPresets).catch(() => toast.error("Could not load voice presets"))
    // The full catalogue is a nicety; the presets work without it.
    api.getVoiceCatalogue("en-").then(setCatalogue).catch(() => undefined)
  }, [])

  const handleGenerate = async () => {
    if (!script.trim()) return toast.error("Please enter a script")

    setIsLoading(true)
    setResult(null)
    try {
      const res = await api.generateVoiceover({
        script,
        preset_id: selectedPreset,
        voice: overrideVoice === "preset" ? undefined : overrideVoice,
        rate: rate === "default" ? undefined : rate,
      })
      setResult(res)
      toast.success(
        res.duration_seconds
          ? `Voiceover ready — ${res.duration_seconds.toFixed(1)}s`
          : "Voiceover ready"
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Voice synthesis failed")
    } finally {
      setIsLoading(false)
    }
  }

  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Voiceover Studio</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
              Neural TTS
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
              Free &amp; Unlimited
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate a downloadable MP3 voiceover from a script, then attach it to any clip in Video Studio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="md:col-span-7 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Delivery Preset
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((v) => {
                const isSelected = selectedPreset === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(v.id)
                      setOverrideVoice("preset")
                    }}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Speed</Label>
              <Select value={rate} onValueChange={setRate}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEEDS.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-xs">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Specific voice{catalogue.length > 0 ? ` (${catalogue.length} free)` : ""}
              </Label>
              <Select value={overrideVoice} onValueChange={setOverrideVoice}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="preset" className="text-xs">
                    Use preset voice
                  </SelectItem>
                  {catalogue.map((v) => (
                    <SelectItem key={v.voice} value={v.voice} className="text-xs">
                      {v.voice.replace("Neural", "")} · {v.gender} · {v.locale}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Script
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {wordCount} words · ~{Math.max(1, Math.round((wordCount / 150) * 60))}s read
              </span>
            </div>
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={7}
              placeholder="Write the voiceover script exactly as it should be read aloud..."
              className="text-sm resize-none"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !script.trim()}
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Generate Voiceover
              </>
            )}
          </Button>
        </div>

        {/* Output */}
        <div className="md:col-span-5">
          <Card className="border-border/60 bg-card/40 h-full">
            <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[300px] space-y-4">
              {result ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-center h-20 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <Volume2 className="h-8 w-8 text-blue-400" />
                  </div>

                  <audio
                    src={`${BACKEND_URL}${result.audio_url}`}
                    controls
                    autoPlay
                    className="w-full"
                  />

                  <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                    {result.duration_seconds != null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {result.duration_seconds.toFixed(1)}s
                      </span>
                    )}
                    <span className="font-mono">{result.engine_used}</span>
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full text-xs">
                    <a href={`${BACKEND_URL}${result.audio_url}`} download target="_blank" rel="noreferrer">
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download MP3
                    </a>
                  </Button>

                  <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                    To put this on a clip, generate a video in Video Studio and use{" "}
                    <span className="text-foreground font-medium">Add voiceover</span>.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Mic className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">No voiceover yet</p>
                  <p className="text-xs text-muted-foreground/70 max-w-[220px] mx-auto">
                    Pick a delivery preset, write your script, and generate a downloadable MP3.
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
