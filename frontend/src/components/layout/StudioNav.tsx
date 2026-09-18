"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FolderOpen, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/** Grouped so the bar reads as a workflow rather than a flat list of pages. */
const NAV_GROUPS: { label: string; items: { label: string; href: string; tag?: string }[] }[] = [
  {
    label: "Create",
    items: [
      { label: "Copy", href: "/text-studio" },
      { label: "Images", href: "/image-studio" },
      { label: "Product shots", href: "/product-photoshoot", tag: "10 modes" },
      { label: "Video", href: "/video-studio" },
    ],
  },
  {
    label: "Finish",
    items: [
      { label: "Stitch", href: "/stitch" },
      { label: "Voiceover", href: "/audio" },
      { label: "Templates", href: "/templates" },
    ],
  },
  {
    label: "More",
    items: [
      { label: "Cinema", href: "/cinema" },
      { label: "Restyle", href: "/genjutsu" },
      { label: "Brand kit", href: "/brand-kit" },
      { label: "API", href: "/api-docs" },
      { label: "MCP", href: "/mcp" },
    ],
  },
]

export function StudioNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto flex h-16 items-center gap-6 px-4 sm:px-6 lg:px-8">
        {/* Identity */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 grid place-items-center shadow-lg shadow-blue-600/25 ring-1 ring-white/10">
            <span className="font-black text-white text-sm tracking-tight">S</span>
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-bold text-[15px] tracking-tight text-foreground">
              Segue IT
            </span>
            <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Marketing Studio
            </span>
          </div>
        </Link>

        {/* Grouped navigation */}
        <nav className="hidden lg:flex items-center gap-7 overflow-x-auto no-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mr-1.5">
                {group.label}
              </span>
              {group.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                      active
                        ? "text-foreground bg-blue-500/12"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-2.5 -bottom-[13px] h-0.5 rounded-full bg-blue-500" />
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Compact nav for narrow screens */}
        <nav className="flex lg:hidden items-center gap-1 overflow-x-auto no-scrollbar">
          {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap ${
                isActive(item.href)
                  ? "text-foreground bg-blue-500/12"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className="hidden xl:inline-flex border-blue-500/30 bg-blue-500/10 text-blue-300 text-[11px] font-medium gap-1.5"
          >
            <Sparkles className="h-3 w-3" />
            Free models
          </Badge>
          <Button asChild variant="outline" size="sm" className="h-9 text-[13px] gap-1.5">
            <Link href="/history">
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Assets</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
