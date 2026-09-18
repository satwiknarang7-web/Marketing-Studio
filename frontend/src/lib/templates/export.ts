/**
 * Export a rendered template to PNG or SVG.
 *
 * Deliberately does NOT use html-to-image's `toPng`. That call hangs
 * indefinitely in testing — reproduced on a bare 50x50 div, so it is the
 * library's own rasterization step, not anything about our DOM. `toSvg` is
 * reliable, so we take its output and rasterize it ourselves. That also lets us
 * draw at exact canvas dimensions and enforce a timeout instead of leaving the
 * UI stuck on "Exporting..." forever.
 */

const LOAD_TIMEOUT_MS = 20_000

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const timer = setTimeout(
      () => reject(new Error("Timed out rasterizing the design.")),
      LOAD_TIMEOUT_MS
    )
    img.onload = () => {
      clearTimeout(timer)
      resolve(img)
    }
    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error("Could not rasterize the design."))
    }
    img.src = url
  })
}

/** Serialize the live DOM to a self-contained SVG data URL, fonts embedded. */
export async function renderToSvgUrl(
  node: HTMLElement,
  width: number,
  height: number
): Promise<string> {
  const { toSvg } = await import("html-to-image")
  return toSvg(node, {
    width,
    height,
    // The node is visually scaled to fit the editor; export at full size.
    style: { transform: "scale(1)", transformOrigin: "top left" },
  })
}

export async function renderToPngBlob(
  node: HTMLElement,
  width: number,
  height: number
): Promise<Blob> {
  const svgUrl = await renderToSvgUrl(node, width, height)
  const img = await loadImage(svgUrl)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get a 2D drawing context.")
  ctx.drawImage(img, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the PNG."))),
      "image/png"
    )
  })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = filename
  a.click()
}
