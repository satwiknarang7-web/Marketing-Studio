"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Search,
  Folder,
  Bell,
  Sparkles,
  Zap,
  Film,
  Camera,
  Layers,
  Wand2,
  Check,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function HiggsfieldNavbar() {
  const pathname = usePathname()

  const navLinks = [
    { label: "Explore", href: "/", badge: null },
    { label: "Image", href: "/image-studio", badge: null },
    { label: "Video", href: "/video-studio", badge: null },
    { label: "Audio", href: "/audio", badge: null },
    { label: "MCP", href: "/mcp", badge: null },
    { label: "API", href: "/api-docs", badge: "New", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  ]

  const featureLinks = [
    { label: "ChatGPT Plugin", href: "/chatgpt-plugin", badge: "Free", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { label: "Genjutsu", href: "/genjutsu", badge: "New", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { label: "Cinema", href: "/cinema", badge: null },
    { label: "Stitch", href: "/stitch", badge: "New", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { label: "Templates", href: "/templates", badge: "New", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { label: "Marketing", href: "/product-photoshoot", badge: "10 Modes", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  ]

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left: Logo & Navigation */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
          {/* Higgsfield squircle logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:opacity-90 transition-opacity">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-black"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12c2-4 4-6 8-6s6 2 8 6-4 6-8 6-6-2-8-6z" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <span className="font-extrabold tracking-tight text-sm text-foreground hidden sm:inline-block">
              HIGGSFIELD<span className="text-blue-500">.AI</span>
            </span>
          </Link>

          {/* Primary Nav Links */}
          <nav className="flex items-center gap-1 shrink-0 text-xs font-medium">
            {navLinks.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                    active
                      ? "text-blue-400 font-semibold bg-blue-500/10 shadow-sm shadow-blue-500/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full border font-mono ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Separator */}
            <div className="h-4 w-[1px] bg-border/60 mx-1.5 shrink-0" />

            {/* Feature Links */}
            {featureLinks.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all shrink-0 ${
                    active
                      ? "text-blue-400 font-semibold bg-blue-500/10 shadow-sm shadow-blue-500/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full border font-mono ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Actions, Free Badge, Assets, Avatar */}
        <div className="flex items-center gap-2.5 shrink-0 ml-4">
          {/* Quick Search */}
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-border/70 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-blue-500/40 transition-colors"
            title="Search Models & Videos"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* 100% Free Edition Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold">
            <Zap className="h-3.5 w-3.5 text-blue-400 fill-blue-400" />
            <span>100% Free Studio</span>
          </div>

          {/* Assets Button */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 gap-1.5"
          >
            <Link href="/history">
              <Folder className="h-4 w-4 text-blue-400" />
              <span className="hidden md:inline">Assets</span>
            </Link>
          </Button>

          {/* Separator */}
          <div className="h-4 w-[1px] bg-border/60 mx-0.5" />

          {/* Brand Kit / Settings */}
          <Link
            href="/brand-kit"
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Brand Kit Settings"
          >
            <Wand2 className="h-4 w-4" />
          </Link>

          {/* User Profile Avatar with Glowing Electric Blue Ring */}
          <div className="relative cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-500 ring-offset-2 ring-offset-background shadow-md shadow-blue-500/20">
              S
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-background animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  )
}
