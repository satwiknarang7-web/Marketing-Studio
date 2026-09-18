"use client"

import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Undo2, Redo2, Download, Trash2, Copy, Eye, EyeOff, Lock, Unlock,
  ChevronUp, ChevronDown, Type, Square, ImageIcon, LayoutTemplate,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TemplateCanvas } from "@/components/templates/TemplateCanvas"
import { EditorCanvas } from "@/components/templates/EditorCanvas"
import { Inspector } from "@/components/templates/Inspector"
import { TEMPLATES } from "@/lib/templates/presets"
import { CANVAS_PRESETS, type Layer, type Template } from "@/lib/templates/types"
import {
  addLayer, duplicateLayer, initHistory, pushHistory, redo, removeLayer,
  reorderLayer, resizeCanvas, undo, updateLayer, type History,
} from "@/lib/templates/editor"
import { renderToPngBlob, renderToSvgUrl, downloadBlob, downloadDataUrl } from "@/lib/templates/export"
import { toast } from "sonner"

const CANVAS_DISPLAY_WIDTH = 460

export default function TemplatesPage() {
  const [history, setHistory] = useState<History>(() => initHistory(TEMPLATES[0]))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const template = history.present
  const selected = template.layers.find((l) => l.id === selectedId) ?? null

  /** Commit a change and snapshot it for undo. */
  const commit = useCallback((next: Template) => {
    setHistory((h) => pushHistory(h, next))
  }, [])

  /** Live edit during a drag — replaces `present` without touching history. */
  const live = useCallback((layerId: string, patch: Partial<Layer>) => {
    setHistory((h) => ({ ...h, present: updateLayer(h.present, layerId, patch) }))
  }, [])

  // Mirror of history for callbacks that must read the latest state without
  // being re-created on every change.
  const historyRef = useRef(history)
  historyRef.current = history

  /**
   * One drag = one undo step. The state at pointer-down is stashed, and pushed
   * onto the past when the drag ends.
   *
   * Both of these mutate the ref OUTSIDE the setState updater. React invokes
   * updaters twice under StrictMode, so a ref write inside one runs twice and
   * the second pass sees its own first pass's mutation.
   */
  const dragBaseline = useRef<Template | null>(null)

  const beginEdit = useCallback(() => {
    if (!dragBaseline.current) dragBaseline.current = historyRef.current.present
  }, [])

  const commitDrag = useCallback(() => {
    const baseline = dragBaseline.current
    dragBaseline.current = null
    if (!baseline) return
    setHistory((h) =>
      baseline === h.present
        ? h
        : { past: [...h.past, baseline].slice(-50), present: h.present, future: [] }
    )
  }, [])

  const loadTemplate = (t: Template) => {
    setHistory(initHistory(structuredClone(t)))
    setSelectedId(null)
  }

  // Keyboard: undo/redo and delete.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        setHistory((h) => (e.shiftKey ? redo(h) : undo(h)))
        return
      }
      if (!typing && (e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault()
        commit(removeLayer(template, selectedId))
        setSelectedId(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedId, template, commit])

  const runExport = async (format: "png" | "svg") => {
    if (!exportRef.current) return
    setIsExporting(true)
    // Let the chrome-free render commit before rasterizing, or the selection
    // handles end up baked into the exported file.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    )
    const { width, height } = template.canvas
    const stem = `${template.id}-${width}x${height}`
    try {
      if (format === "svg") {
        const url = await renderToSvgUrl(exportRef.current, width, height)
        downloadDataUrl(url, `${stem}.svg`)
      } else {
        const blob = await renderToPngBlob(exportRef.current, width, height)
        downloadBlob(blob, `${stem}.png`)
      }
      toast.success(`${format.toUpperCase()} exported at ${width}x${height}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  const canvasPresetId =
    CANVAS_PRESETS.find(
      (p) => p.width === template.canvas.width && p.height === template.canvas.height
    )?.id ?? "custom"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Templates</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
              Editor
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Drag anything, resize from the handles, double-click text to retype. Every layer is yours to move.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setHistory(undo)} disabled={history.past.length === 0} className="h-8 px-2">
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setHistory(redo)} disabled={history.future.length === 0} className="h-8 px-2">
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => runExport("svg")} disabled={isExporting} className="h-8 text-xs">
            SVG
          </Button>
          <Button size="sm" onClick={() => runExport("png")} disabled={isExporting} className="h-8 bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            {isExporting ? "Exporting..." : "Export PNG"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Template picker */}
        <div className="xl:col-span-2 space-y-2">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Start from
          </Label>
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => loadTemplate(t)}
                className={`rounded-lg border p-2 text-left transition-all ${
                  t.id === template.id
                    ? "border-blue-600 bg-blue-500/5"
                    : "border-border/60 hover:border-border bg-card/40"
                }`}
              >
                <div className="flex justify-center mb-1.5">
                  <TemplateCanvas template={t} displayWidth={120} className="rounded shadow" />
                </div>
                <p className="font-semibold text-[11px] leading-tight">{t.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{t.vibe}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="xl:col-span-6 space-y-3">
          <div className="flex items-center gap-2">
            <Select
              value={canvasPresetId}
              onValueChange={(id) => {
                const p = CANVAS_PRESETS.find((c) => c.id === id)
                if (p) commit(resizeCanvas(template, p.width, p.height))
              }}
            >
              <SelectTrigger className="h-8 text-xs w-56"><SelectValue placeholder="Custom size" /></SelectTrigger>
              <SelectContent>
                {CANVAS_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.label} · {p.width}×{p.height}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 ml-auto">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => commit(addLayer(template, "text"))}>
                <Type className="h-3.5 w-3.5" /> Text
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => commit(addLayer(template, "shape"))}>
                <Square className="h-3.5 w-3.5" /> Shape
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => commit(addLayer(template, "image"))}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <ImageIcon className="h-3.5 w-3.5" /> Image
              </Button>
            </div>
          </div>

          <div className="flex justify-center rounded-xl border border-border/60 bg-[#0b0e14] p-5 overflow-auto">
            <EditorCanvas
              template={template}
              displayWidth={CANVAS_DISPLAY_WIDTH}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={live}
              onBeginEdit={beginEdit}
              onCommit={commitDrag}
              exportRef={exportRef}
              hideChrome={isExporting}
            />
          </div>
        </div>

        {/* Layers + Inspector */}
        <div className="xl:col-span-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Layers ({template.layers.length})
            </Label>
            <div className="rounded-lg border border-border/60 bg-card/40 divide-y divide-border/40 max-h-64 overflow-y-auto">
              {[...template.layers].reverse().map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedId(layer.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 cursor-pointer text-xs ${
                    layer.id === selectedId ? "bg-blue-500/10 text-blue-400" : "hover:bg-muted/20"
                  }`}
                >
                  <span className="flex-1 truncate">{layer.name}</span>
                  <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">{layer.type}</span>

                  <button type="button" title={layer.hidden ? "Show" : "Hide"}
                    onClick={(e) => { e.stopPropagation(); commit(updateLayer(template, layer.id, { hidden: !layer.hidden })) }}
                    className="p-0.5 hover:text-foreground text-muted-foreground">
                    {layer.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                  <button type="button" title={layer.locked ? "Unlock" : "Lock"}
                    onClick={(e) => { e.stopPropagation(); commit(updateLayer(template, layer.id, { locked: !layer.locked })) }}
                    className="p-0.5 hover:text-foreground text-muted-foreground">
                    {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </button>
                  <button type="button" title="Bring forward"
                    onClick={(e) => { e.stopPropagation(); commit(reorderLayer(template, layer.id, 1)) }}
                    className="p-0.5 hover:text-foreground text-muted-foreground">
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button type="button" title="Send backward"
                    onClick={(e) => { e.stopPropagation(); commit(reorderLayer(template, layer.id, -1)) }}
                    className="p-0.5 hover:text-foreground text-muted-foreground">
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button type="button" title="Duplicate"
                    onClick={(e) => { e.stopPropagation(); commit(duplicateLayer(template, layer.id)) }}
                    className="p-0.5 hover:text-foreground text-muted-foreground">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button type="button" title="Delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      commit(removeLayer(template, layer.id))
                      if (selectedId === layer.id) setSelectedId(null)
                    }}
                    className="p-0.5 hover:text-destructive text-muted-foreground">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <LayoutTemplate className="h-3 w-3" />
              {selected ? selected.name : "Nothing selected"}
            </Label>
            <div className="rounded-lg border border-border/60 bg-card/40 p-3">
              <Inspector
                layer={selected}
                onChange={(patch) => selected && commit(updateLayer(template, selected.id, patch))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
