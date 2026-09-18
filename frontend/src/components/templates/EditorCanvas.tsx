"use client"

import * as React from "react"
import { useRef, useState } from "react"
import type { Layer, Template } from "@/lib/templates/types"
import { LayerView, textContentStyle } from "./TemplateLayer"
import { resizeFrame, type Handle } from "@/lib/templates/editor"

const HANDLES: { id: Handle; cx: number; cy: number; cursor: string }[] = [
  { id: "nw", cx: 0, cy: 0, cursor: "nwse-resize" },
  { id: "n", cx: 0.5, cy: 0, cursor: "ns-resize" },
  { id: "ne", cx: 1, cy: 0, cursor: "nesw-resize" },
  { id: "e", cx: 1, cy: 0.5, cursor: "ew-resize" },
  { id: "se", cx: 1, cy: 1, cursor: "nwse-resize" },
  { id: "s", cx: 0.5, cy: 1, cursor: "ns-resize" },
  { id: "sw", cx: 0, cy: 1, cursor: "nesw-resize" },
  { id: "w", cx: 0, cy: 0.5, cursor: "ew-resize" },
]

type Drag =
  | { mode: "move"; layerId: string; startX: number; startY: number; origin: Layer }
  | { mode: "resize"; layerId: string; handle: Handle; startX: number; startY: number; origin: Layer }

export function EditorCanvas({
  template,
  displayWidth,
  selectedId,
  onSelect,
  onChange,
  onBeginEdit,
  onCommit,
  exportRef,
  hideChrome = false,
}: {
  template: Template
  displayWidth: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** Live update during a drag; not pushed to history. */
  onChange: (layerId: string, patch: Partial<Layer>) => void
  /** A drag/edit is starting — the parent snapshots for undo. */
  onBeginEdit: () => void
  /** Drag finished — close the undo step. */
  onCommit: () => void
  /** The element that gets rasterized on export. */
  exportRef?: React.Ref<HTMLDivElement>
  /** Suppress selection outline and handles so they are not baked into exports. */
  hideChrome?: boolean
}) {
  const scale = displayWidth / template.canvas.width
  const drag = useRef<Drag | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const selected = template.layers.find((l) => l.id === selectedId) ?? null

  const handlePointerDown = (e: React.PointerEvent, layer: Layer, handle?: Handle) => {
    if (layer.locked || editingId) return
    e.stopPropagation()
    e.preventDefault()
    onBeginEdit()
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      // Capture is an optimisation; dragging still works without it.
    }
    onSelect(layer.id)
    drag.current = handle
      ? { mode: "resize", layerId: layer.id, handle, startX: e.clientX, startY: e.clientY, origin: layer }
      : { mode: "move", layerId: layer.id, startX: e.clientX, startY: e.clientY, origin: layer }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    // Screen pixels -> canvas units.
    const dx = (e.clientX - d.startX) / scale
    const dy = (e.clientY - d.startY) / scale

    if (d.mode === "move") {
      onChange(d.layerId, {
        x: Math.round(d.origin.x + dx),
        y: Math.round(d.origin.y + dy),
      })
    } else {
      onChange(d.layerId, resizeFrame(d.origin, d.handle, dx, dy))
    }
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current) return
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* capture may already be gone */
    }
    drag.current = null
    onCommit()
  }

  return (
    <div
      style={{
        width: displayWidth,
        height: template.canvas.height * scale,
        position: "relative",
        flexShrink: 0,
        touchAction: "none",
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerDown={() => {
        if (!editingId) onSelect(null)
      }}
    >
      <div
        ref={exportRef}
        style={{
          width: template.canvas.width,
          height: template.canvas.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
          background: template.canvas.background,
        }}
      >
        {template.layers.map((layer) => {
          const isEditing = editingId === layer.id

          if (isEditing && layer.type === "text") {
            return (
              <div
                key={layer.id}
                style={{
                  position: "absolute",
                  left: layer.x,
                  top: layer.y,
                  width: layer.w,
                  height: layer.h,
                  transform: layer.rotate ? `rotate(${layer.rotate}deg)` : undefined,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <textarea
                  autoFocus
                  value={layer.text}
                  onChange={(ev) => onChange(layer.id, { text: ev.target.value })}
                  onBlur={() => {
                    setEditingId(null)
                    onCommit()
                  }}
                  onPointerDown={(ev) => ev.stopPropagation()}
                  style={{
                    ...textContentStyle(layer),
                    background: "rgba(59,130,246,0.12)",
                    border: `${2 / scale}px solid #3b82f6`,
                    outline: "none",
                    resize: "none",
                    height: "100%",
                    padding: 0,
                    // A transparent-filled outline face is invisible while typing.
                    color: layer.strokeOnly ? layer.color : textContentStyle(layer).color,
                    WebkitTextStrokeWidth: 0,
                  }}
                />
              </div>
            )
          }

          return (
            <LayerView
              key={layer.id}
              layer={layer}
              chrome={{
                cursor: layer.locked ? "not-allowed" : "move",
                outline:
                  !hideChrome && selectedId === layer.id
                    ? `${1.5 / scale}px solid #3b82f6`
                    : undefined,
              }}
              interactive={{
                onPointerDown: (e) => handlePointerDown(e, layer),
                onDoubleClick:
                  layer.type === "text"
                    ? (e) => {
                        e.stopPropagation()
                        onBeginEdit()
                        setEditingId(layer.id)
                      }
                    : undefined,
              }}
            />
          )
        })}

        {/* Resize handles, drawn in canvas units so they sit on the layer even
            when it is rotated. */}
        {!hideChrome && selected && !selected.locked && !selected.hidden && editingId !== selected.id && (
          <div
            style={{
              position: "absolute",
              left: selected.x,
              top: selected.y,
              width: selected.w,
              height: selected.h,
              transform: selected.rotate ? `rotate(${selected.rotate}deg)` : undefined,
              pointerEvents: "none",
            }}
          >
            {HANDLES.map((h) => {
              const size = 10 / scale
              return (
                <div
                  key={h.id}
                  onPointerDown={(e) => handlePointerDown(e, selected, h.id)}
                  style={{
                    position: "absolute",
                    left: selected.w * h.cx - size / 2,
                    top: selected.h * h.cy - size / 2,
                    width: size,
                    height: size,
                    background: "#ffffff",
                    border: `${1.5 / scale}px solid #3b82f6`,
                    borderRadius: size / 4,
                    cursor: h.cursor,
                    pointerEvents: "auto",
                    touchAction: "none",
                  }}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
