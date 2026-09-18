"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Type, Image as ImageIcon, Camera, Video, Scissors, Mic,
  LayoutTemplate, ArrowRight, Clock, Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { api, BACKEND_URL } from "@/lib/api"
import type { HistoryItem } from "@/types"

/** The studio's actual capabilities, in the order a campaign is usually built. */
const TOOLS = [
  {
    href: "/text-studio",
    icon: Type,
    title: "Campaign copy",
    blurb: "Posts, ad copy, subject lines and taglines across 13 formats.",
    meta: "Qwen 2.5",
  },
  {
    href: "/image-studio",
    icon: ImageIcon,
    title: "Images",
    blurb: "Original visuals at any social size, from a written brief.",
    meta: "FLUX.1",
  },
  {
    href: "/product-photoshoot",
    icon: Camera,
    title: "Product shots",
    blurb: "Ten commercial photography modes — studio, lifestyle, hero, editorial.",
    meta: "10 modes",
  },
  {
    href: "/video-studio",
    icon: Video,
    title: "Video",
    blurb: "Short clips with real director camera moves and lens choices.",
    meta: "LTX-Video",
  },
  {
    href: "/stitch",
    icon: Scissors,
    title: "Stitch",
    blurb: "Join clips into a longer sequence with cuts or crossfades.",
    meta: "Timeline",
  },
  {
    href: "/audio",
    icon: Mic,
    title: "Voiceover",
    blurb: "Narrate a script in any of 47 English voices, then lay it over video.",
    meta: "47 voices",
  },
  {
    href: "/templates",
    icon: LayoutTemplate,
    title: "Templates",
    blurb: "Design social posts on a real canvas — every layer yours to move.",
    meta: "Editor",
  },
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function StudioHome() {
  const [recent, setRecent] = useState<HistoryItem[]>([])

  useEffect(() => {
    api
      .getHistory({ limit: 8 })
      .then((r) => setRecent(r.items))
      .catch(() => undefined)
  }, [])

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="studio-glow relative overflow-hidden rounded-2xl border border-border/60 px-6 py-10 sm:px-10 sm:py-14">
        <div className="max-w-2xl space-y-4">
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-300 text-[11px] gap-1.5"
          >
            <Sparkles className="h-3 w-3" />
            Running entirely on free, open models
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">
            Everything the campaign needs,
            <span className="block text-blue-400">made in one place.</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            Write the copy, shoot the product, cut the video, record the voiceover and lay
            out the post — without a brief, a budget line, or waiting on an agency.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/image-studio"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-colors"
            >
              Start creating
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border bg-card/60 hover:bg-card font-medium text-sm transition-colors"
            >
              Browse templates
            </Link>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Studios</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Each one does a single job well.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative rounded-xl border border-border/60 bg-card/50 p-5 hover:border-blue-500/50 hover:bg-card transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 grid place-items-center">
                  <tool.icon className="h-[18px] w-[18px] text-blue-400" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider mt-1">
                  {tool.meta}
                </span>
              </div>
              <h3 className="font-semibold text-[15px] mt-4 group-hover:text-blue-300 transition-colors">
                {tool.title}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mt-1">
                {tool.blurb}
              </p>
              <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-muted-foreground/0 group-hover:text-blue-400 transition-all group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent work */}
      {recent.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Recent work</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Everything you have made, newest first.
              </p>
            </div>
            <Link
              href="/history"
              className="text-[13px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
            >
              All assets <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {recent.map((item) => {
              const result = item.result as Record<string, unknown>
              const videoUrl = typeof result?.video_url === "string" ? result.video_url : null
              const images = Array.isArray(result?.images) ? (result.images as string[]) : []
              const preview = images[0]

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/60 bg-card/50 overflow-hidden hover:border-blue-500/40 transition-colors"
                >
                  <div className="aspect-video bg-black/40 relative">
                    {videoUrl ? (
                      <video
                        src={`${BACKEND_URL}${videoUrl}`}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    ) : preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt={item.prompt} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center">
                        <Type className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/70 text-white/90 capitalize">
                      {item.type}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[12px] line-clamp-2 leading-snug">{item.prompt}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(item.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
