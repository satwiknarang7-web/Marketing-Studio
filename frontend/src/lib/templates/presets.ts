import type { Template } from "./types"

/**
 * Starting templates.
 *
 * These intentionally share no common structure. One is a full-bleed photo with
 * a rotated slab, one is type-only on flat colour, one is an off-centre editorial
 * split, one is a stacked outline headline. If a new template can be produced by
 * editing an existing one's text, it is not a new template.
 */

export const TEMPLATES: Template[] = [
  {
    id: "neon-drop",
    name: "Neon Drop",
    vibe: "Product launch · high contrast · nightlife",
    canvas: { width: 1080, height: 1350, background: "#07070c" },
    layers: [
      {
        id: "bg",
        name: "Backdrop",
        type: "backdrop",
        x: 0, y: 0, w: 1080, h: 1350,
        paint: { kind: "linear", from: "#0a0a18", to: "#241043", angle: 160 },
      },
      {
        id: "photo",
        name: "Product photo",
        type: "image",
        x: 90, y: 210, w: 900, h: 760,
        source: "placeholder",
        fit: "cover",
        mask: "rounded",
        radius: 28,
        dim: 12,
      },
      {
        id: "glow",
        name: "Glow bar",
        type: "shape",
        shape: "rect",
        x: -40, y: 905, w: 1160, h: 120,
        rotate: -6,
        opacity: 95,
        fill: { kind: "linear", from: "#00e5ff", to: "#7b2dff", angle: 90 },
        radius: 8,
      },
      {
        id: "kicker",
        name: "Kicker",
        type: "text",
        x: 90, y: 120, w: 520, h: 50,
        text: "NEW THIS WEEK",
        font: "mono", size: 30, weight: 600, tracking: 8,
        color: "#00e5ff", uppercase: true,
      },
      {
        id: "headline",
        name: "Headline",
        type: "text",
        x: 80, y: 916, w: 900, h: 100,
        rotate: -6,
        text: "DROP 01",
        font: "display", size: 82, weight: 900, tracking: -2,
        color: "#07070c", align: "center", uppercase: true,
      },
      {
        id: "sub",
        name: "Supporting line",
        type: "text",
        x: 90, y: 1090, w: 720, h: 140,
        text: "Limited run. Once it's gone, it's gone.",
        font: "grotesk", size: 40, weight: 400, lineHeight: 1.3,
        color: "#c9c9e6",
      },
    ],
  },

  {
    id: "quiet-statement",
    name: "Quiet Statement",
    vibe: "Type only · no imagery · brand voice",
    canvas: { width: 1080, height: 1080, background: "#f2efe9" },
    layers: [
      {
        id: "bg",
        name: "Backdrop",
        type: "backdrop",
        x: 0, y: 0, w: 1080, h: 1080,
        paint: { kind: "solid", color: "#f2efe9" },
      },
      {
        id: "rule",
        name: "Hairline",
        type: "shape",
        shape: "line",
        x: 120, y: 300, w: 180, h: 3,
        fill: { kind: "solid", color: "#1c1c1c" },
      },
      {
        id: "quote",
        name: "Statement",
        type: "text",
        x: 120, y: 360, w: 840, h: 420,
        text: "We don't chase the trend.\nWe outlast it.",
        font: "serif", size: 88, weight: 400, lineHeight: 1.18, tracking: -1,
        color: "#1c1c1c",
      },
      {
        id: "attrib",
        name: "Attribution",
        type: "text",
        x: 120, y: 860, w: 500, h: 40,
        text: "— Segue IT",
        font: "grotesk", size: 28, weight: 500, tracking: 2,
        color: "#6b6459",
      },
    ],
  },

  {
    id: "editorial-split",
    name: "Editorial Split",
    vibe: "Magazine · asymmetric · lifestyle",
    canvas: { width: 1080, height: 1350, background: "#ffffff" },
    layers: [
      {
        id: "bg",
        name: "Backdrop",
        type: "backdrop",
        x: 0, y: 0, w: 1080, h: 1350,
        paint: { kind: "solid", color: "#ffffff" },
      },
      {
        id: "photo",
        name: "Full bleed photo",
        type: "image",
        x: 0, y: 0, w: 1080, h: 820,
        source: "placeholder",
        fit: "cover",
      },
      {
        id: "block",
        name: "Colour block",
        type: "shape",
        shape: "rect",
        x: 620, y: 660, w: 460, h: 300,
        fill: { kind: "solid", color: "#d8442f" },
      },
      {
        id: "issue",
        name: "Issue number",
        type: "text",
        x: 660, y: 700, w: 380, h: 220,
        text: "04",
        font: "condensed", size: 180, weight: 700,
        color: "#ffffff",
      },
      {
        id: "title",
        name: "Title",
        type: "text",
        x: 70, y: 900, w: 520, h: 260,
        text: "Field\nNotes",
        font: "condensed", size: 130, weight: 700, lineHeight: 0.92, tracking: -3,
        color: "#111111", uppercase: true,
      },
      {
        id: "body",
        name: "Standfirst",
        type: "text",
        x: 70, y: 1180, w: 620, h: 120,
        text: "Three things we learned shipping to 40 clients this quarter.",
        font: "serif", size: 30, weight: 400, lineHeight: 1.35,
        color: "#4a4a4a",
      },
    ],
  },

  {
    id: "outline-stack",
    name: "Outline Stack",
    vibe: "Bold · poster · announcement",
    canvas: { width: 1080, height: 1080, background: "#111d3a" },
    layers: [
      {
        id: "bg",
        name: "Backdrop",
        type: "backdrop",
        x: 0, y: 0, w: 1080, h: 1080,
        paint: { kind: "radial", from: "#1b2d5c", to: "#0a1124" },
      },
      {
        id: "ring",
        name: "Ring",
        type: "shape",
        shape: "ellipse",
        x: 300, y: 150, w: 480, h: 480,
        fill: { kind: "solid", color: "transparent" },
        stroke: { color: "#f4b942", width: 6 },
      },
      {
        id: "l1",
        name: "Line 1 (outline)",
        type: "text",
        x: 90, y: 300, w: 900, h: 130,
        text: "BIGGER",
        font: "display", size: 128, weight: 900, tracking: -4,
        color: "#f4b942", align: "center", uppercase: true,
        strokeOnly: true, strokeWidth: 2,
      },
      {
        id: "l2",
        name: "Line 2 (solid)",
        type: "text",
        x: 90, y: 425, w: 900, h: 130,
        text: "BOLDER",
        font: "display", size: 128, weight: 900, tracking: -4,
        color: "#ffffff", align: "center", uppercase: true,
      },
      {
        id: "l3",
        name: "Line 3 (outline)",
        type: "text",
        x: 90, y: 550, w: 900, h: 130,
        text: "BRIGHTER",
        font: "display", size: 128, weight: 900, tracking: -4,
        color: "#f4b942", align: "center", uppercase: true,
        strokeOnly: true, strokeWidth: 2,
      },
      {
        id: "cta",
        name: "CTA pill",
        type: "shape",
        shape: "rect",
        x: 370, y: 800, w: 340, h: 86,
        radius: 43,
        fill: { kind: "solid", color: "#f4b942" },
      },
      {
        id: "ctatext",
        name: "CTA label",
        type: "text",
        x: 370, y: 823, w: 340, h: 50,
        text: "SEE THE WORK",
        font: "grotesk", size: 28, weight: 700, tracking: 3,
        color: "#111d3a", align: "center", uppercase: true,
      },
    ],
  },
]

export const TEMPLATES_BY_ID = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t])
) as Record<string, Template>
