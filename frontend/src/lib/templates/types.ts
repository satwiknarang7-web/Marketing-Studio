/**
 * Template document model.
 *
 * Deliberately NOT a slot schema. There is no "headline slot" or "logo slot",
 * because that produces templates that are all visibly the same layout with
 * different words in it. A template here is a canvas plus an arbitrary stack of
 * freely positioned layers, so two templates can have nothing structurally in
 * common — one can be six rotated text fragments over a duotone photo, another a
 * single centred word on flat colour.
 *
 * Every layer carries its own geometry, so anything can be moved, resized,
 * rotated, restyled or deleted, and new layers can be added to any template.
 */

/** Position and size in canvas units (see Canvas.width/height). */
export interface Frame {
  x: number
  y: number
  w: number
  h: number
  /** Degrees, clockwise, around the layer's own centre. */
  rotate?: number
  opacity?: number
}

export type Paint =
  | { kind: "solid"; color: string }
  | { kind: "linear"; from: string; to: string; angle: number }
  | { kind: "radial"; from: string; to: string }

export interface BaseLayer extends Frame {
  id: string
  /** Shown in the layer list. */
  name: string
  locked?: boolean
  hidden?: boolean
}

export interface TextLayer extends BaseLayer {
  type: "text"
  text: string
  font: FontToken
  size: number
  weight: number
  /** Letter spacing in canvas units; negative tightens. */
  tracking?: number
  lineHeight?: number
  align?: "left" | "center" | "right"
  color: string
  italic?: boolean
  uppercase?: boolean
  /** Renders as an outline rather than a fill. */
  strokeOnly?: boolean
  strokeWidth?: number
}

export interface ShapeLayer extends BaseLayer {
  type: "shape"
  shape: "rect" | "ellipse" | "line" | "triangle"
  fill: Paint
  /** Corner radius in canvas units; rect only. */
  radius?: number
  stroke?: { color: string; width: number }
}

export interface ImageLayer extends BaseLayer {
  type: "image"
  /**
   * Where the picture comes from. "placeholder" renders a labelled block so a
   * template reads correctly before the user drops their own image in.
   */
  source: "placeholder" | "url"
  url?: string
  fit?: "cover" | "contain"
  /** Clip the image to a shape. */
  mask?: "none" | "circle" | "rounded"
  radius?: number
  /** 0-100; a quick way to sit an image behind text. */
  dim?: number
}

export interface BackdropLayer extends BaseLayer {
  type: "backdrop"
  paint: Paint
}

export type Layer = TextLayer | ShapeLayer | ImageLayer | BackdropLayer

export interface Canvas {
  width: number
  height: number
  background: string
}

export interface Template {
  id: string
  name: string
  /** Free-text; these are not a taxonomy, just a hint for browsing. */
  vibe: string
  canvas: Canvas
  layers: Layer[]
}

/**
 * Font tokens rather than raw family names, so the renderer controls what is
 * actually loaded and a template can never reference a font that is not there.
 */
export type FontToken =
  | "display"
  | "grotesk"
  | "serif"
  | "mono"
  | "condensed"
  | "script"

/** Common social sizes, for resizing a template after the fact. */
export const CANVAS_PRESETS = [
  { id: "ig_post", label: "Instagram Post", width: 1080, height: 1080 },
  { id: "ig_story", label: "Instagram Story", width: 1080, height: 1920 },
  { id: "ig_portrait", label: "Instagram Portrait", width: 1080, height: 1350 },
  { id: "li_post", label: "LinkedIn Post", width: 1200, height: 1200 },
  { id: "x_post", label: "X / Twitter Post", width: 1200, height: 675 },
  { id: "fb_cover", label: "Facebook Cover", width: 1200, height: 630 },
] as const
