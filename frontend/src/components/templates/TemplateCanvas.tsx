"use client"

import * as React from "react"
import type { Template } from "@/lib/templates/types"
import { LayerView } from "./TemplateLayer"

/**
 * Read-only render of a template at its native canvas size, scaled to fit
 * `displayWidth`. Keeping the model in canvas units means preview and export
 * cannot drift.
 */
export function TemplateCanvas({
  template,
  displayWidth,
  className,
}: {
  template: Template
  displayWidth: number
  className?: string
}) {
  const scale = displayWidth / template.canvas.width

  return (
    <div
      className={className}
      style={{
        width: displayWidth,
        height: template.canvas.height * scale,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: template.canvas.width,
          height: template.canvas.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
          background: template.canvas.background,
        }}
      >
        {template.layers.map((layer) => (
          <LayerView key={layer.id} layer={layer} />
        ))}
      </div>
    </div>
  )
}
