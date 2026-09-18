"use client"

import * as React from "react"
import { useState } from "react"
import { Cpu, Copy, Check, Terminal, ExternalLink, Zap, Layers, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const MCP_CONFIG = {
  mcpServers: {
    "higgsfield-studio": {
      command: "npx",
      args: ["-y", "@higgsfield/cli", "mcp"],
      env: {
        HIGGSFIELD_API_URL: "http://localhost:8000/api",
      },
    },
  },
}

const MCP_TOOLS = [
  { name: "photoshoot_generate", desc: "10 commercial product camera modes with lighting and multi-aspect framing" },
  { name: "video_generate", desc: "Cinema camera path motion synthesis and prompt enrichment" },
  { name: "image_generate", desc: "FLUX.1-schnell 4K photorealistic marketing imagery" },
]

export default function MCPPage() {
  const [copied, setCopied] = useState(false)

  const copyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(MCP_CONFIG, null, 2))
    setCopied(true)
    toast.success("MCP configuration copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/20 via-card to-card p-6 md:p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
              Model Context Protocol
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
              100% Free
            </Badge>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Higgsfield MCP Server
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Allow Claude Code, Cursor, Antigravity, and AI agents to invoke the video models and photoshoot modes autonomously.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* MCP Config JSON (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <Card className="border-border/60 bg-card/40 overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-400" />
                mcpServers Configuration
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={copyConfig}
                className="h-7 text-xs px-2 gap-1"
              >
                {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy JSON</>}
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="rounded-lg bg-black/90 border border-border/60 p-3 overflow-x-auto">
                <pre className="font-mono text-xs text-blue-300 leading-relaxed">
                  {JSON.stringify(MCP_CONFIG, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available MCP Tools (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Exposed MCP Tools
          </h3>
          <div className="space-y-2">
            {MCP_TOOLS.map((t) => (
              <div key={t.name} className="p-3 rounded-xl border border-border/60 bg-card/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span className="font-mono text-xs font-bold text-blue-400">{t.name}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-3.5">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
