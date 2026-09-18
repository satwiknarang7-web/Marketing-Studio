import type { Layer, Template, TextLayer, ShapeLayer, ImageLayer } from "./types"

export type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w"

let idCounter = 0
export function newId(prefix = "layer"): string {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

/**
 * Rotate a vector by `deg`. Resizing a rotated layer happens in the layer's own
 * axes, so the pointer delta has to be rotated into that frame first.
 */
export function rotateVec(dx: number, dy: number, deg: number): { dx: number; dy: number } {
  if (!deg) return { dx, dy }
  const r = (deg * Math.PI) / 180
  const cos = Math.cos(r)
  const sin = Math.sin(r)
  return { dx: dx * cos + dy * sin, dy: -dx * sin + dy * cos }
}

const MIN_SIZE = 8

/**
 * Apply a resize from `handle` given a pointer delta already converted to
 * canvas units. Keeps the opposite edge visually anchored for unrotated layers.
 */
export function resizeFrame(
  layer: Layer,
  handle: Handle,
  dxCanvas: number,
  dyCanvas: number
): Pick<Layer, "x" | "y" | "w" | "h"> {
  const { dx, dy } = rotateVec(dxCanvas, dyCanvas, layer.rotate ?? 0)

  let { x, y, w, h } = layer

  if (handle.includes("e")) w = layer.w + dx
  if (handle.includes("s")) h = layer.h + dy
  if (handle.includes("w")) {
    w = layer.w - dx
    x = layer.x + dx
  }
  if (handle.includes("n")) {
    h = layer.h - dy
    y = layer.y + dy
  }

  // Clamp without letting the anchored edge drift once the minimum is hit.
  if (w < MIN_SIZE) {
    if (handle.includes("w")) x = layer.x + (layer.w - MIN_SIZE)
    w = MIN_SIZE
  }
  if (h < MIN_SIZE) {
    if (handle.includes("n")) y = layer.y + (layer.h - MIN_SIZE)
    h = MIN_SIZE
  }

  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) }
}

export function updateLayer(
  template: Template,
  layerId: string,
  patch: Partial<Layer>
): Template {
  return {
    ...template,
    layers: template.layers.map((l) =>
      l.id === layerId ? ({ ...l, ...patch } as Layer) : l
    ),
  }
}

export function removeLayer(template: Template, layerId: string): Template {
  return { ...template, layers: template.layers.filter((l) => l.id !== layerId) }
}

export function duplicateLayer(template: Template, layerId: string): Template {
  const index = template.layers.findIndex((l) => l.id === layerId)
  if (index === -1) return template
  const source = template.layers[index]
  const copy: Layer = {
    ...source,
    id: newId(source.type),
    name: `${source.name} copy`,
    x: source.x + 24,
    y: source.y + 24,
  }
  const layers = [...template.layers]
  layers.splice(index + 1, 0, copy)
  return { ...template, layers }
}

/** Move a layer within the stack. Index 0 is the back of the canvas. */
export function reorderLayer(template: Template, layerId: string, direction: -1 | 1): Template {
  const index = template.layers.findIndex((l) => l.id === layerId)
  const target = index + direction
  if (index === -1 || target < 0 || target >= template.layers.length) return template
  const layers = [...template.layers]
  ;[layers[index], layers[target]] = [layers[target], layers[index]]
  return { ...template, layers }
}

export function addLayer(template: Template, kind: "text" | "shape" | "image"): Template {
  const cx = Math.round(template.canvas.width / 2)
  const cy = Math.round(template.canvas.height / 2)

  let layer: Layer
  if (kind === "text") {
    const text: TextLayer = {
      id: newId("text"), name: "New text", type: "text",
      x: cx - 300, y: cy - 60, w: 600, h: 120,
      text: "Your words here",
      font: "grotesk", size: 64, weight: 700, color: "#ffffff", align: "center",
    }
    layer = text
  } else if (kind === "shape") {
    const shape: ShapeLayer = {
      id: newId("shape"), name: "New shape", type: "shape",
      x: cx - 150, y: cy - 150, w: 300, h: 300,
      shape: "rect", radius: 16,
      fill: { kind: "solid", color: "#3b82f6" },
    }
    layer = shape
  } else {
    const image: ImageLayer = {
      id: newId("image"), name: "New image", type: "image",
      x: cx - 250, y: cy - 250, w: 500, h: 500,
      source: "placeholder", fit: "cover", mask: "rounded", radius: 20,
    }
    layer = image
  }

  return { ...template, layers: [...template.layers, layer] }
}

/**
 * Resize the canvas, scaling every layer so a composition survives being
 * retargeted from, say, a square post to a story.
 */
export function resizeCanvas(template: Template, width: number, height: number): Template {
  const sx = width / template.canvas.width
  const sy = height / template.canvas.height
  // Uniform scale for type and radii so nothing is stretched out of proportion.
  const s = Math.min(sx, sy)

  return {
    ...template,
    canvas: { ...template.canvas, width, height },
    layers: template.layers.map((l) => {
      const scaled: Layer = {
        ...l,
        x: Math.round(l.x * sx),
        y: Math.round(l.y * sy),
        w: Math.round(l.w * sx),
        h: Math.round(l.h * sy),
      }
      if (scaled.type === "text") {
        scaled.size = Math.max(8, Math.round(scaled.size * s))
        if (scaled.tracking) scaled.tracking = scaled.tracking * s
      }
      if (scaled.type === "shape" && scaled.radius) {
        scaled.radius = Math.round(scaled.radius * s)
      }
      return scaled
    }),
  }
}

/** Bounded undo/redo history. */
export interface History {
  past: Template[]
  present: Template
  future: Template[]
}

const HISTORY_LIMIT = 50

export function initHistory(template: Template): History {
  return { past: [], present: template, future: [] }
}

export function pushHistory(history: History, next: Template): History {
  const past = [...history.past, history.present].slice(-HISTORY_LIMIT)
  return { past, present: next, future: [] }
}

export function undo(history: History): History {
  if (history.past.length === 0) return history
  const previous = history.past[history.past.length - 1]
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  }
}

export function redo(history: History): History {
  if (history.future.length === 0) return history
  const [next, ...rest] = history.future
  return { past: [...history.past, history.present], present: next, future: rest }
}
