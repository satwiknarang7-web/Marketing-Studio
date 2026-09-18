"use client"

import * as React from "react"
import { useState, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ChevronRight,
  ChevronLeft,
  Video,
  Image as ImageIcon,
  Sparkles,
  Zap,
  Film,
  Camera,
  Layers,
  Wand2,
  Check,
  Play,
  Volume2,
  VolumeX,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ExplorePage() {
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)

  // Top Showcase Cards (16:9 cinematic looping cards matching screenshot)
  const showcaseCards = [
    {
      id: "api",
      title: "HIGGSFIELD API",
      subtitle: "Best prices in GenAI across 50+ models in one API",
      videoUrl: "/videos/api-showcase.mp4",
      href: "/api-docs",
      badge: "Free & Open",
      overlay: (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
              ! ^
            </span>
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              &gt; locked <span className="text-blue-400">discount</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "genjutsu",
      title: "HIGGSFIELD GENJUTSU",
      subtitle: "One upload in. Endless new visions out.",
      videoUrl: "/videos/genjutsu-camera.mp4",
      href: "/genjutsu",
      badge: "New Model",
      overlay: (
        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider bg-black/70 px-2.5 py-1 rounded text-white border border-white/20">
              KEEP 📷
            </span>
            <span className="text-xs font-mono bg-blue-600/80 px-2 py-0.5 rounded text-white font-semibold">
              OUTPUT
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold bg-black/60 px-2 py-0.5 rounded text-zinc-300">
              INPUT
            </span>
            <div className="text-lg md:text-xl font-extrabold uppercase tracking-tight text-white bg-black/50 px-2 py-1 rounded w-fit">
              CAMERA MOVEMENT
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "motion",
      title: "HIGGSFIELD AI MOTION DESIGNER",
      subtitle: "ChatGPT can now do motion design in After Effects",
      videoUrl: "/videos/motion-designer.mp4",
      href: "/video-studio",
      badge: "Motion V2",
      overlay: (
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="text-[11px] font-bold bg-white/90 text-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            🎵 wavu music
          </span>
        </div>
      ),
    },
  ]

  // Model Grid Cards
  const modelGrid = [
    {
      id: "seedance",
      title: "Seedance 2.5",
      badge: "TOP",
      badgeColor: "bg-blue-600 text-white",
      tag: "Video",
      tagIcon: Video,
      description: "The most advanced video model",
      href: "/video-studio?model=seedance",
    },
    {
      id: "nano-banana",
      title: "Nano Banana Pro",
      badge: null,
      tag: "Image",
      tagIcon: ImageIcon,
      description: "Generate high-quality visuals",
      href: "/image-studio?model=nano-banana",
    },
    {
      id: "genjutsu-tool",
      title: "Higgsfield Genjutsu",
      badge: "NEW",
      badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      tag: "Video-to-Video",
      tagIcon: Wand2,
      description: "One video, many versions",
      href: "/genjutsu",
    },
    {
      id: "cinema-studio",
      title: "Cinema Studio",
      badge: "PRO",
      badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      tag: "Cinema",
      tagIcon: Film,
      description: "Director camera controls & optical physics",
      href: "/cinema",
    },
    {
      id: "product-photoshoot",
      title: "Product Photoshoot",
      badge: "10 MODES",
      badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      tag: "Commercial",
      tagIcon: Camera,
      description: "10 commercial modes with studio lighting",
      href: "/product-photoshoot",
    },
    {
      id: "soul-photoreal",
      title: "Soul 2.0 Photoreal",
      badge: "NEW",
      badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      tag: "FLUX Photoreal",
      tagIcon: Sparkles,
      description: "Next-gen hyper-realistic commercial visuals",
      href: "/image-studio?model=soul",
    },
  ]

  const handleNext = () => {
    setCarouselIndex((prev) => (prev + 1) % showcaseCards.length)
  }

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev - 1 + showcaseCards.length) % showcaseCards.length)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Section: Showcase Carousel (3 Widescreen Cards) */}
      <div className="relative group">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {showcaseCards.map((card, idx) => (
            <Link
              key={card.id}
              href={card.href}
              className="group/card block rounded-2xl lg:rounded-3xl overflow-hidden border border-border/60 bg-card/40 hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
            >
              {/* 16:9 Video Canvas */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/90">
                <video
                  src={card.videoUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover opacity-90 group-hover/card:scale-105 group-hover/card:opacity-100 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                {card.overlay}
              </div>

              {/* Card Meta */}
              <div className="p-4 pt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm tracking-tight text-foreground group-hover/card:text-blue-400 transition-colors uppercase">
                    {card.title}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {card.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {card.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Floating Carousel Navigation Button */}
        <button
          onClick={handleNext}
          type="button"
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/90 border border-border/80 text-foreground flex items-center justify-center shadow-lg hover:border-blue-500/60 hover:text-blue-400 transition-all z-10 hidden xl:flex"
          title="Next Showcase"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Second Section: Left ChatGPT Card + Right 6-Model Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Left Big Card: HIGGSFIELD IN ChatGPT */}
        <div className="lg:col-span-5 rounded-2xl lg:rounded-3xl border border-border/60 bg-card/40 p-5 md:p-6 flex flex-col justify-between overflow-hidden relative group hover:border-blue-500/40 transition-all">
          <div className="space-y-4 z-10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                  HIGGSFIELD IN
                  <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    ChatGPT
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  70+ models powered by GPT-5 Astra &amp; LTX-Video
                </p>
              </div>

              {/* Install Button */}
              <Button
                asChild
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 h-8 rounded-full shadow-md shadow-blue-500/20"
              >
                <Link href="/chatgpt-plugin">
                  + Install
                </Link>
              </Button>
            </div>

            {/* Status Checklist Mockup */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                ⚡ Higgsfield connected (Free Community Edition)
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Film className="h-3.5 w-3.5 text-blue-400" />
                <span>Generating 40 UGC videos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-blue-400" />
                <span>Building commercial website assets</span>
              </div>
            </div>
          </div>

          {/* Overlapping Phone / Video Previews */}
          <div className="relative mt-6 pt-4 h-48 md:h-56 flex items-end justify-center overflow-hidden rounded-xl bg-black/40 border border-border/40">
            {/* Phone Mockup 1 */}
            <div className="w-36 md:w-40 aspect-[9/16] rounded-xl overflow-hidden border-2 border-border/80 shadow-2xl -rotate-6 transform -translate-x-6 translate-y-3 shrink-0 bg-black">
              <video
                src="/videos/ugc-demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Phone Mockup 2 */}
            <div className="w-36 md:w-40 aspect-[9/16] rounded-xl overflow-hidden border-2 border-blue-500/40 shadow-2xl rotate-6 transform translate-x-6 translate-y-1 shrink-0 bg-black">
              <video
                src="/videos/fashion-tryout.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right 6-Model Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {modelGrid.map((m) => {
            const Icon = m.tagIcon
            return (
              <Link
                key={m.id}
                href={m.href}
                className="group p-4 rounded-xl border border-border/60 bg-card/40 hover:border-blue-500/50 hover:bg-card/70 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Icon + Tag */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 border border-border/60 flex items-center justify-center text-muted-foreground group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/40 flex items-center gap-1">
                      {m.tag}
                    </span>
                  </div>

                  {/* Title + Badge */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-blue-400 transition-colors">
                      {m.title}
                    </h4>
                    {m.badge && (
                      <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded ${m.badgeColor}`}>
                        {m.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {m.description}
                  </p>
                </div>

                <div className="pt-3 text-[11px] font-medium text-blue-400/80 group-hover:text-blue-400 flex items-center gap-1">
                  Launch Studio &rarr;
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
