"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Cpu, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
          Marketing Studio
        </h1>
        <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 py-0.5 px-2 text-[11px] border-blue-500/30 bg-blue-500/10 text-blue-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          Dual model pipeline
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border px-2.5 py-1 rounded-lg">
          <Cpu className="h-3.5 w-3.5 text-blue-400" />
          <span>FLUX + Qwen + LTX-Video</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title="Toggle theme"
          className="h-9 w-9 rounded-lg"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  )
}
