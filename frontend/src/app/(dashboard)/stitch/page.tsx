"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
  Film, Plus, X, ArrowUp, ArrowDown, Loader2, Download, Scissors,
  RefreshCw, Volume2, VolumeX, Mic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, BACKEND_URL } from "@/lib/api"
import { toast } from "sonner"
import type { StudioClip, VideoStitchResponse } from "@/types"

/** A clip placed on the timeline. Keyed separately so one clip can repeat. */
interface TimelineItem {
  key: string
  clip: StudioClip
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "--"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${s.toFixed(0).padStart(2, "0")}` : `${s.toFixed(1)}s`
}

export default function StitchPage() {
  const [library, setLibrary] = useState<StudioClip[]>([])
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [transition, setTransition] = useState<"cut" | "crossfade">("cut")
  const [fade, setFade] = useState("0.5")
  const [isLoading, setIsLoading] = useState(true)
  const [isStitching, setIsStitching] = useState(false)
  const [result, setResult] = useState<VideoStitchResponse | null>(null)

  // Voiceover over the finished cut.
  const [voScript, setVoScript] = useState("")
  const [voPreset, setVoPreset] = useState("brand_friendly")
  const [isVoLoading, setIsVoLoading] = useState(false)
  const [voicedUrl, setVoicedUrl] = useState<string | null>(null)

  const loadLibrary = async () => {
    setIsLoading(true)
    try {
      setLibrary(await api.getClips())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load clips")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLibrary()
  }, [])

  const add = (clip: StudioClip) =>
    setTimeline((t) => [...t, { key: `${clip.filename}-${Date.now()}-${t.length}`, clip }])

  const removeAt = (i: number) => setTimeline((t) => t.filter((_, idx) => idx !== i))

  const move = (i: number, dir: -1 | 1) =>
    setTimeline((t) => {
      const j = i + dir
      if (j < 0 || j >= t.length) return t
      const next = [...t]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const totalSource = timeline.reduce((sum, it) => sum + (it.clip.duration_seconds ?? 0), 0)
  const fadeNum = parseFloat(fade) || 0
  const estimated =
    transition === "crossfade" && timeline.length > 1
      ? Math.max(0, totalSource - fadeNum * (timeline.length - 1))
      : totalSource

  const handleStitch = async () => {
    if (timeline.length < 2) return toast.error("Add at least two clips to the timeline")
    setIsStitching(true)
    setResult(null)
    setVoicedUrl(null)
    try {
      const res = await api.stitchVideos({
        video_urls: timeline.map((t) => t.clip.url),
        transition,
        transition_duration: fadeNum,
      })
      setResult(res)
      toast.success(
        `Joined ${res.clip_count} clips into ${formatDuration(res.duration_seconds)}`
      )
      loadLibrary()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join the clips")
    } finally {
      setIsStitching(false)
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
        fit: "pad",
      })
      setVoicedUrl(merged.video_url)
      toast.success("Voiceover added")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add voiceover")
    } finally {
      setIsVoLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Stitch</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
              Timeline
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Join clips into one longer video. Different sizes, frame rates and audio are
            normalised automatically.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadLibrary} className="h-8 text-xs gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Library */}
        <div className="lg:col-span-5 space-y-2">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Your clips ({library.length})
          </Label>

          {!isLoading && library.length === 0 && (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No clips yet. Generate something in Video Studio first.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-[540px] overflow-y-auto pr-1">
            {library.map((clip) => (
              <button
                key={clip.url}
                type="button"
                onClick={() => add(clip)}
                className="group relative rounded-lg overflow-hidden border border-border/60 hover:border-blue-500/60 bg-card/40 text-left transition-all"
              >
                <video
                  src={`${BACKEND_URL}${clip.url}`}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full aspect-video object-cover bg-black"
                  onMouseEnter={(e) => e.currentTarget.play().catch(() => undefined)}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause()
                    e.currentTarget.currentTime = 0
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="p-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="font-mono">{formatDuration(clip.duration_seconds)}</span>
                  <span>{clip.width}×{clip.height}</span>
                  {clip.has_audio ? (
                    <Volume2 className="h-2.5 w-2.5 text-blue-400 ml-auto" />
                  ) : (
                    <VolumeX className="h-2.5 w-2.5 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline + output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Timeline ({timeline.length})
              </Label>
              {timeline.length > 0 && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  ≈ {formatDuration(estimated)}
                </span>
              )}
            </div>

            <div className="rounded-lg border border-border/60 bg-card/40 min-h-[120px] divide-y divide-border/40">
              {timeline.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
                  <Film className="h-5 w-5 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    Click clips on the left to build a sequence.
                  </p>
                </div>
              )}

              {timeline.map((item, i) => (
                <div key={item.key} className="flex items-center gap-2 p-2">
                  <span className="text-[10px] font-mono text-muted-foreground w-5">{i + 1}</span>
                  <video
                    src={`${BACKEND_URL}${item.clip.url}`}
                    muted
                    preload="metadata"
                    className="h-10 w-16 object-cover rounded bg-black shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] truncate font-mono">
                      {item.clip.filename.slice(0, 8)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDuration(item.clip.duration_seconds)} · {item.clip.width}×
                      {item.clip.height}
                    </p>
                  </div>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-25">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === timeline.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-25">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => removeAt(i)}
                    className="p-1 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Transition</Label>
              <Select value={transition} onValueChange={(v) => setTransition(v as "cut" | "crossfade")}>
                <SelectTrigger className="h-9 text-xs w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cut" className="text-xs">Hard cut</SelectItem>
                  <SelectItem value="crossfade" className="text-xs">Crossfade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {transition === "crossfade" && (
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Fade</Label>
                <Select value={fade} onValueChange={setFade}>
                  <SelectTrigger className="h-9 text-xs w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.25" className="text-xs">0.25s</SelectItem>
                    <SelectItem value="0.5" className="text-xs">0.5s</SelectItem>
                    <SelectItem value="1" className="text-xs">1s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleStitch}
              disabled={isStitching || timeline.length < 2}
              className="h-9 ml-auto bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5"
            >
              {isStitching ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Joining...</>
              ) : (
                <><Scissors className="h-3.5 w-3.5" /> Join {timeline.length} clips</>
              )}
            </Button>
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-3 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">
                  {formatDuration(result.duration_seconds)} · {result.width}×{result.height} ·{" "}
                  {result.clip_count} clips
                </p>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">
                  {result.has_audio ? "with audio" : "silent"}
                </Badge>
              </div>

              <video
                src={`${BACKEND_URL}${voicedUrl ?? result.video_url}`}
                controls
                className="w-full rounded-lg bg-black"
              />

              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <a
                  href={`${BACKEND_URL}${voicedUrl ?? result.video_url}`}
                  download
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download MP4
                </a>
              </Button>

              <div className="pt-2 border-t border-border/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Mic className="h-3.5 w-3.5 text-blue-400" />
                  <Label className="text-xs font-semibold">Add voiceover to the full cut</Label>
                </div>
                <Textarea
                  value={voScript}
                  onChange={(e) => setVoScript(e.target.value)}
                  rows={2}
                  placeholder="Script to be read over the whole sequence..."
                  className="text-xs resize-none"
                />
                <div className="flex gap-2">
                  <Select value={voPreset} onValueChange={setVoPreset}>
                    <SelectTrigger className="h-8 text-[11px] flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand_friendly" className="text-xs">Friendly Brand</SelectItem>
                      <SelectItem value="narrator_deep" className="text-xs">Deep Narrator</SelectItem>
                      <SelectItem value="ad_energetic" className="text-xs">High-Energy Ad</SelectItem>
                      <SelectItem value="calm_luxury" className="text-xs">Calm &amp; Premium</SelectItem>
                      <SelectItem value="uk_professional" className="text-xs">British Professional</SelectItem>
                      <SelectItem value="au_casual" className="text-xs">Australian Casual</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddVoiceover}
                    disabled={isVoLoading || !voScript.trim()}
                    size="sm"
                    className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    {isVoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
