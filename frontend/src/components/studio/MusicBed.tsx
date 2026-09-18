"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Music, Upload, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, BACKEND_URL } from "@/lib/api"
import { toast } from "sonner"
import type { MusicTrack } from "@/types"

const LEVELS = [
  { value: "0.10", label: "Subtle" },
  { value: "0.18", label: "Balanced" },
  { value: "0.30", label: "Forward" },
  { value: "0.55", label: "Feature" },
]

/**
 * Lays a music bed under a finished clip.
 *
 * Tracks are uploaded rather than generated: the free music-generation Spaces
 * are unreliable, and bundling third-party tracks would mean shipping audio
 * whose licence we cannot verify. Teams bring music they are cleared to use.
 */
export function MusicBed({
  videoUrl,
  onMixed,
}: {
  videoUrl: string
  onMixed: (newVideoUrl: string) => void
}) {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [selected, setSelected] = useState<string>("")
  const [level, setLevel] = useState("0.18")
  const [duck, setDuck] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isMixing, setIsMixing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      const list = await api.getMusic()
      setTracks(list)
      if (list.length && !selected) setSelected(list[0].url)
    } catch {
      /* no music yet is a normal state */
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const track = await api.uploadMusic(file)
      setTracks((prev) => [track, ...prev])
      setSelected(track.url)
      toast.success(`Added ${file.name}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleMix = async () => {
    if (!selected) return toast.error("Choose a track first")
    setIsMixing(true)
    try {
      const res = await api.addMusicBed({
        video_url: videoUrl,
        music_url: selected,
        gain: parseFloat(level),
        duck,
      })
      onMixed(res.video_url)
      toast.success(
        res.ducked
          ? "Music added, ducked under the narration"
          : "Music added"
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add music")
    } finally {
      setIsMixing(false)
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Music className="h-3.5 w-3.5 text-accent" />
        <Label className="text-xs font-semibold">Music bed</Label>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 p-3 space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            No tracks yet. Upload music you are licensed to use — free libraries include{" "}
            <a
              href="https://pixabay.com/music/"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline inline-flex items-center gap-0.5"
            >
              Pixabay <ExternalLink className="h-2.5 w-2.5" />
            </a>
            ,{" "}
            <a
              href="https://freemusicarchive.org/"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              Free Music Archive
            </a>{" "}
            and the YouTube Audio Library.
          </p>
        </div>
      ) : (
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="h-8 text-[11px]">
            <SelectValue placeholder="Choose a track" />
          </SelectTrigger>
          <SelectContent>
            {tracks.map((t) => (
              <SelectItem key={t.url} value={t.url} className="text-xs">
                {t.filename.slice(0, 24)}
                {t.duration_seconds ? ` · ${t.duration_seconds.toFixed(0)}s` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {selected && (
        <audio src={`${BACKEND_URL}${selected}`} controls className="w-full h-8" />
      )}

      <div className="flex items-center gap-2">
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="h-8 text-[11px] w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((l) => (
              <SelectItem key={l.value} value={l.value} className="text-xs">
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-1.5 text-[11px] cursor-pointer select-none">
          <input type="checkbox" checked={duck} onChange={(e) => setDuck(e.target.checked)} />
          Duck under speech
        </label>

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 ml-auto"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          title="Upload a track"
        >
          {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        </Button>

        <Button
          onClick={handleMix}
          disabled={isMixing || !selected}
          size="sm"
          className="h-8 text-xs bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isMixing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/flac,.mp3,.wav,.m4a,.ogg,.flac"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
