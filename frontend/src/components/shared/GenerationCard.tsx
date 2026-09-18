"use client"

import * as React from "react"
import { HistoryItem } from "@/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Trash2, Type, Image as ImageIcon, Video } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface GenerationCardProps {
  item: HistoryItem
  onDelete?: (id: string) => void
}

/**
 * Extracts a displayable content string from the result JSON.
 * Backend stores different shapes per type:
 *   text  -> JSON array of strings, or { contents: [...] }
 *   image -> { filepath, images: [dataURI] }
 *   video -> { video_url: "/data/videos/..." }
 */
function getDisplayContent(item: HistoryItem): string {
  const r = item.result
  if (!r) return ""

  if (item.type === "text") {
    // result is a JSON-stringified array stored in DB
    if (Array.isArray(r)) return (r as string[]).join("\n\n---\n\n")
    if (typeof r === "string") return r
    return JSON.stringify(r)
  }
  if (item.type === "image") {
    const images = (r as Record<string, unknown>).images as string[] | undefined
    return images?.[0] ?? ""
  }
  if (item.type === "video") {
    const url = (r as Record<string, unknown>).video_url as string | undefined
    return url ? `http://localhost:8000${url}` : ""
  }
  return ""
}

export function GenerationCard({ item, onDelete }: GenerationCardProps) {
  const content = getDisplayContent(item)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        item.type === "text" ? content : item.prompt
      )
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy")
    }
  }

  const downloadContent = () => {
    if (item.type === "text") {
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `generation-${item.id}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      window.open(content, "_blank")
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-2">
          {item.type === "text" && <Type className="h-4 w-4 text-blue-500" />}
          {item.type === "image" && <ImageIcon className="h-4 w-4 text-blue-500" />}
          {item.type === "video" && <Video className="h-4 w-4 text-blue-500" />}
          <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
        </div>
        <Badge variant="outline" className="capitalize">
          {item.type}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-3">
        <div className="text-sm font-medium line-clamp-2" title={item.prompt}>
          &ldquo;{item.prompt}&rdquo;
        </div>

        <div className="flex-1 bg-muted/50 rounded-md overflow-hidden flex items-center justify-center">
          {item.type === "text" && (
            <div className="p-3 text-sm text-muted-foreground line-clamp-4">{content}</div>
          )}
          {item.type === "image" && content && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content} alt={item.prompt} className="w-full h-40 object-cover" loading="lazy" />
          )}
          {item.type === "video" && content && (
            <video src={content} className="w-full h-40 object-cover" controls preload="none" />
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between gap-2 border-t mt-auto">
        {item.type === "text" && (
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="flex-1 h-8">
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={downloadContent} className="flex-1 h-8">
          <Download className="h-3.5 w-3.5 mr-1.5" /> Download
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="flex-none h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
