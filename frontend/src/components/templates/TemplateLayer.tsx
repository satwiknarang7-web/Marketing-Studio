"use client"

import * as React from "react"
import type { Layer, Paint, FontToken } from "@/lib/templates/types"

/**
 * The single source of truth for how a layer looks.
 *
 * Both the read-only preview and the editor render through this, and export
 * rasterizes the same DOM — so there is exactly one renderer and no way for the
 * preview, the editor and the exported PNG to disagree.
 */

export const FONT_VARS: Record<FontToken, string> = {
  display: "var(--tpl-display), system-ui, sans-serif",
  grotesk: "var(--tpl-grotesk), system-ui, sans-serif",
  serif: "var(--tpl-serif), Georgia, serif",
  mono: "var(--tpl-mono), ui-monospace, monospace",
  condensed: "var(--tpl-condensed), Impact, sans-serif",
  script: "var(--tpl-serif), cursive",
}

export function paintToCss(paint: Paint): string {
  switch (paint.kind) {
    case "solid":
      return paint.color
    case "linear":
      return `linear-gradient(${paint.angle}deg, ${paint.from}, ${paint.to})`
    case "radial":
      return `radial-gradient(circle at 50% 40%, ${paint.from}, ${paint.to})`
  }
}

export function frameStyle(layer: Layer, chrome?: React.CSSProperties): React.CSSProperties {
  return {
    position: "absolute",
    left: layer.x,
    top: layer.y,
    width: layer.w,
    height: layer.h,
    transform: layer.rotate ? `rotate(${layer.rotate}deg)` : undefined,
    opacity: layer.opacity != null ? layer.opacity / 100 : undefined,
    ...chrome,
  }
}

/** Style for the inner content of a text layer, without the frame. */
export function textContentStyle(
  layer: Extract<Layer, { type: "text" }>
): React.CSSProperties {
  const style: React.CSSProperties = {
    fontFamily: FONT_VARS[layer.font],
    fontSize: layer.size,
    fontWeight: layer.weight,
    fontStyle: layer.italic ? "italic" : undefined,
    letterSpacing: layer.tracking ?? 0,
    lineHeight: layer.lineHeight ?? 1.1,
    textAlign: layer.align ?? "left",
    textTransform: layer.uppercase ? "uppercase" : undefined,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    width: "100%",
  }

  if (layer.strokeOnly) {
    style.color = "transparent"
    style.WebkitTextStrokeWidth = layer.strokeWidth ?? 2
    style.WebkitTextStrokeColor = layer.color
  } else {
    style.color = layer.color
  }

  return style
}

export function LayerView({
  layer,
  chrome,
  interactive,
}: {
  layer: Layer
  chrome?: React.CSSProperties
  /** Extra props for pointer handling in the editor. */
  interactive?: React.HTMLAttributes<HTMLDivElement>
}) {
  if (layer.hidden) return null
  const base = frameStyle(layer, chrome)

  switch (layer.type) {
    case "backdrop":
      return (
        <div {...interactive} style={{ ...base, background: paintToCss(layer.paint) }} />
      )

    case "shape": {
      const stroke = layer.stroke
        ? { border: `${layer.stroke.width}px solid ${layer.stroke.color}` }
        : {}
      const fill = paintToCss(layer.fill)
      const common = { ...base, background: fill, ...stroke }

      if (layer.shape === "ellipse") {
        return <div {...interactive} style={{ ...common, borderRadius: "50%" }} />
      }
      if (layer.shape === "line") {
        return <div {...interactive} style={{ ...base, background: fill }} />
      }
      if (layer.shape === "triangle") {
        return (
          <div
            {...interactive}
            style={{ ...common, clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
          />
        )
      }
      return <div {...interactive} style={{ ...common, borderRadius: layer.radius ?? 0 }} />
    }

    case "image": {
      const radius =
        layer.mask === "circle" ? "50%" : layer.mask === "rounded" ? layer.radius ?? 24 : 0

      if (layer.source === "url" && layer.url) {
        return (
          <div {...interactive} style={{ ...base, borderRadius: radius, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={layer.url}
              alt={layer.name}
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: layer.fit ?? "cover",
                display: "block",
                pointerEvents: "none",
              }}
            />
            {layer.dim ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `rgba(0,0,0,${layer.dim / 100})`,
                }}
              />
            ) : null}
          </div>
        )
      }

      return (
        <div
          {...interactive}
          style={{
            ...base,
            borderRadius: radius,
            background: "repeating-linear-gradient(45deg, #2a2a35 0 14px, #23232d 14px 28px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8a8a9e",
            fontFamily: FONT_VARS.mono,
            fontSize: 22,
            letterSpacing: 1,
          }}
        >
          {layer.name}
        </div>
      )
    }

    case "text":
      return (
        <div
          {...interactive}
          style={{
            ...base,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems:
              layer.align === "center"
                ? "center"
                : layer.align === "right"
                ? "flex-end"
                : "flex-start",
          }}
        >
          <div style={textContentStyle(layer)}>{layer.text}</div>
        </div>
      )
  }
}
