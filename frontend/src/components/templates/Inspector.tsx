"use client"

import * as React from "react"
import type { Layer, FontToken, Paint } from "@/lib/templates/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AssetPicker } from "./AssetPicker"

const FONTS: { id: FontToken; label: string }[] = [
  { id: "display", label: "Display (Archivo Black)" },
  { id: "grotesk", label: "Grotesk (Space Grotesk)" },
  { id: "serif", label: "Serif (Playfair)" },
  { id: "condensed", label: "Condensed (Oswald)" },
  { id: "mono", label: "Mono (JetBrains)" },
]

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function NumberField({
  value,
  onChange,
  step = 1,
}: {
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  return (
    <Input
      type="number"
      step={step}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const n = parseFloat(e.target.value)
        onChange(Number.isFinite(n) ? n : 0)
      }}
      className="h-8 text-xs"
    />
  )
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // `transparent` and other keywords are valid in the model but not in a colour
  // input, so the text field stays authoritative.
  const swatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : "#000000"
  return (
    <div className="flex gap-1.5">
      <input
        type="color"
        value={swatch}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-9 rounded border border-border bg-transparent p-0.5 cursor-pointer shrink-0"
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs font-mono" />
    </div>
  )
}

function PaintEditor({ paint, onChange }: { paint: Paint; onChange: (p: Paint) => void }) {
  return (
    <div className="space-y-2">
      <Select
        value={paint.kind}
        onValueChange={(kind) => {
          if (kind === "solid") onChange({ kind: "solid", color: "#3b82f6" })
          else if (kind === "linear")
            onChange({ kind: "linear", from: "#3b82f6", to: "#7b2dff", angle: 135 })
          else onChange({ kind: "radial", from: "#3b82f6", to: "#0a1124" })
        }}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="solid" className="text-xs">Solid</SelectItem>
          <SelectItem value="linear" className="text-xs">Linear gradient</SelectItem>
          <SelectItem value="radial" className="text-xs">Radial gradient</SelectItem>
        </SelectContent>
      </Select>

      {paint.kind === "solid" ? (
        <ColorField value={paint.color} onChange={(color) => onChange({ ...paint, color })} />
      ) : (
        <>
          <ColorField value={paint.from} onChange={(from) => onChange({ ...paint, from })} />
          <ColorField value={paint.to} onChange={(to) => onChange({ ...paint, to })} />
          {paint.kind === "linear" && (
            <Row label="Angle">
              <NumberField value={paint.angle} onChange={(angle) => onChange({ ...paint, angle })} />
            </Row>
          )}
        </>
      )}
    </div>
  )
}

export function Inspector({
  layer,
  onChange,
}: {
  layer: Layer | null
  onChange: (patch: Partial<Layer>) => void
}) {
  if (!layer) {
    return (
      <p className="text-xs text-muted-foreground">
        Select a layer on the canvas to edit it. Double-click text to retype it.
      </p>
    )
  }

  const set = (patch: Partial<Layer>) => onChange(patch)

  return (
    <div className="space-y-4">
      <Row label="Layer name">
        <Input
          value={layer.name}
          onChange={(e) => set({ name: e.target.value })}
          className="h-8 text-xs"
        />
      </Row>

      {/* Geometry — identical for every layer type. */}
      <div className="grid grid-cols-2 gap-2">
        <Row label="X"><NumberField value={layer.x} onChange={(x) => set({ x })} /></Row>
        <Row label="Y"><NumberField value={layer.y} onChange={(y) => set({ y })} /></Row>
        <Row label="Width"><NumberField value={layer.w} onChange={(w) => set({ w })} /></Row>
        <Row label="Height"><NumberField value={layer.h} onChange={(h) => set({ h })} /></Row>
        <Row label="Rotation°">
          <NumberField value={layer.rotate ?? 0} onChange={(rotate) => set({ rotate })} />
        </Row>
        <Row label="Opacity %">
          <NumberField value={layer.opacity ?? 100} onChange={(opacity) => set({ opacity })} />
        </Row>
      </div>

      {layer.type === "text" && (
        <div className="space-y-3 pt-2 border-t border-border/40">
          <Row label="Text">
            <Textarea
              value={layer.text}
              onChange={(e) => set({ text: e.target.value })}
              rows={3}
              className="text-xs resize-none"
            />
          </Row>
          <Row label="Font">
            <Select value={layer.font} onValueChange={(font) => set({ font: font as FontToken })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="text-xs">{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <div className="grid grid-cols-2 gap-2">
            <Row label="Size"><NumberField value={layer.size} onChange={(size) => set({ size })} /></Row>
            <Row label="Weight">
              <NumberField value={layer.weight} step={100} onChange={(weight) => set({ weight })} />
            </Row>
            <Row label="Tracking">
              <NumberField value={layer.tracking ?? 0} step={0.5} onChange={(tracking) => set({ tracking })} />
            </Row>
            <Row label="Line height">
              <NumberField value={layer.lineHeight ?? 1.1} step={0.05} onChange={(lineHeight) => set({ lineHeight })} />
            </Row>
          </div>
          <Row label="Align">
            <Select value={layer.align ?? "left"} onValueChange={(align) => set({ align: align as "left" | "center" | "right" })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left" className="text-xs">Left</SelectItem>
                <SelectItem value="center" className="text-xs">Center</SelectItem>
                <SelectItem value="right" className="text-xs">Right</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Colour"><ColorField value={layer.color} onChange={(color) => set({ color })} /></Row>
          <div className="flex flex-wrap gap-3 pt-1">
            <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
              <input type="checkbox" checked={!!layer.uppercase} onChange={(e) => set({ uppercase: e.target.checked })} />
              Uppercase
            </label>
            <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
              <input type="checkbox" checked={!!layer.italic} onChange={(e) => set({ italic: e.target.checked })} />
              Italic
            </label>
            <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
              <input type="checkbox" checked={!!layer.strokeOnly} onChange={(e) => set({ strokeOnly: e.target.checked })} />
              Outline only
            </label>
          </div>
          {layer.strokeOnly && (
            <Row label="Outline width">
              <NumberField value={layer.strokeWidth ?? 2} step={0.5} onChange={(strokeWidth) => set({ strokeWidth })} />
            </Row>
          )}
        </div>
      )}

      {layer.type === "shape" && (
        <div className="space-y-3 pt-2 border-t border-border/40">
          <Row label="Shape">
            <Select value={layer.shape} onValueChange={(shape) => set({ shape: shape as "rect" | "ellipse" | "line" | "triangle" })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rect" className="text-xs">Rectangle</SelectItem>
                <SelectItem value="ellipse" className="text-xs">Ellipse</SelectItem>
                <SelectItem value="line" className="text-xs">Bar / line</SelectItem>
                <SelectItem value="triangle" className="text-xs">Triangle</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Fill">
            <PaintEditor paint={layer.fill} onChange={(fill) => set({ fill })} />
          </Row>
          {layer.shape === "rect" && (
            <Row label="Corner radius">
              <NumberField value={layer.radius ?? 0} onChange={(radius) => set({ radius })} />
            </Row>
          )}
        </div>
      )}

      {layer.type === "image" && (
        <div className="space-y-3 pt-2 border-t border-border/40">
          <Row label="Picture">
            <AssetPicker
              currentUrl={layer.url}
              onPick={(url, w, h) => {
                // Match the layer box to the picture's aspect ratio, keeping its
                // current width, so a portrait shot does not arrive squashed.
                const patch: Partial<Layer> = { url, source: "url" }
                if (w && h) patch.h = Math.round(layer.w * (h / w))
                set(patch)
              }}
            />
          </Row>
          {layer.url && (
            <button
              type="button"
              onClick={() => set({ url: undefined, source: "placeholder" })}
              className="text-[11px] text-muted-foreground hover:text-destructive underline"
            >
              Clear picture
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Row label="Fit">
              <Select value={layer.fit ?? "cover"} onValueChange={(fit) => set({ fit: fit as "cover" | "contain" })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover" className="text-xs">Cover</SelectItem>
                  <SelectItem value="contain" className="text-xs">Contain</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Mask">
              <Select value={layer.mask ?? "none"} onValueChange={(mask) => set({ mask: mask as "none" | "circle" | "rounded" })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">None</SelectItem>
                  <SelectItem value="rounded" className="text-xs">Rounded</SelectItem>
                  <SelectItem value="circle" className="text-xs">Circle</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </div>
          <Row label="Darken %">
            <NumberField value={layer.dim ?? 0} onChange={(dim) => set({ dim })} />
          </Row>
        </div>
      )}

      {layer.type === "backdrop" && (
        <div className="space-y-3 pt-2 border-t border-border/40">
          <Row label="Backdrop">
            <PaintEditor paint={layer.paint} onChange={(paint) => set({ paint })} />
          </Row>
        </div>
      )}
    </div>
  )
}
