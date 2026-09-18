"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Upload, RefreshCw, ImageOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api, BACKEND_URL } from "@/lib/api"
import { toast } from "sonner"
import type { StudioAsset } from "@/types"

/**
 * Picks an image for the selected image layer, from whatever the studio has
 * already generated plus anything the team uploads (logos, product shots).
 *
 * Layers store the absolute URL rather than base64 so template documents stay
 * small and exports do not carry a megabyte of inlined data per image.
 */
export function AssetPicker({
  currentUrl,
  onPick,
}: {
  currentUrl?: string
  onPick: (absoluteUrl: string, width: number | null, height: number | null) => void
}) {
  const [assets, setAssets] = useState<StudioAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setAssets(await api.getAssets())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load assets")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const asset = await api.uploadAsset(file)
      setAssets((prev) => [asset, ...prev])
      onPick(`${BACKEND_URL}${asset.url}`, asset.width, asset.height)
      toast.success("Uploaded and applied")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1.5 flex-1"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          Upload
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2" onClick={load} title="Refresh">
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {error && <p className="text-[11px] text-destructive">{error}</p>}

      {!error && !isLoading && assets.length === 0 && (
        <div className="flex flex-col items-center gap-1 py-6 text-center">
          <ImageOff className="h-5 w-5 text-muted-foreground/40" />
          <p className="text-[11px] text-muted-foreground">
            Nothing generated yet. Make something in Image Studio, or upload a file.
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-1.5 max-h-52 overflow-y-auto">
        {assets.map((a) => {
          const absolute = `${BACKEND_URL}${a.url}`
          const isCurrent = currentUrl === absolute
          return (
            <button
              key={a.url}
              type="button"
              title={`${a.filename}${a.width ? ` · ${a.width}x${a.height}` : ""}`}
              onClick={() => onPick(absolute, a.width, a.height)}
              className={`relative aspect-square rounded-md overflow-hidden border transition-all ${
                isCurrent
                  ? "border-blue-500 ring-1 ring-blue-500/40"
                  : "border-border/60 hover:border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={absolute}
                alt={a.filename}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {a.source === "upload" && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-blue-300 text-center leading-tight py-0.5">
                  upload
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
