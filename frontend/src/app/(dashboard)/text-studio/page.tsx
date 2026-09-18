"use client"

import { useState } from "react"
import { Sparkles, Copy, Download, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PromptInput } from "@/components/shared/PromptInput"
import { LoadingOverlay } from "@/components/shared/LoadingOverlay"
import { EmptyState } from "@/components/shared/EmptyState"
import { TEMPLATES, TONES, LENGTHS } from "@/lib/constants"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { TextGenerateResponse } from "@/types"

export default function TextStudioPage() {
  const [template, setTemplate] = useState(TEMPLATES[0].value)
  const [tone, setTone] = useState(TONES[0].value)
  const [length, setLength] = useState(LENGTHS[1].value)
  const [prompt, setPrompt] = useState("")
  const [variations, setVariations] = useState("1")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TextGenerateResponse | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Please enter a prompt")
    setIsLoading(true)
    try {
      const res = await api.generateText({
        template,
        prompt,
        tone,
        length,
        variations_count: parseInt(variations),
      })
      setResult(res)
      toast.success("Text generated successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate text")
    } finally {
      setIsLoading(false)
    }
  }

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const downloadText = (text: string, idx: number) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${template}-variation-${idx + 1}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedTemplate = TEMPLATES.find((t) => t.value === template)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Text Studio</h1>
        <p className="text-muted-foreground mt-2">
          Generate compelling marketing copy for any platform
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 relative">
        {isLoading && <LoadingOverlay message="Crafting your message..." />}

        {/* Controls Panel */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tone of Voice</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Length</Label>
                <div className="flex gap-2">
                  {LENGTHS.map((l) => (
                    <Button
                      key={l.value}
                      type="button"
                      variant={length === l.value ? "default" : "outline"}
                      onClick={() => setLength(l.value)}
                      className="flex-1"
                    >
                      {l.label}
                    </Button>
                  ))}
                </div>
              </div>

              <PromptInput
                label="What is this about?"
                value={prompt}
                onChange={setPrompt}
                placeholder="e.g., A new feature launch for our marketing studio app that helps users create content 10x faster..."
              />

              <div className="space-y-2">
                <Label>Variations</Label>
                <Select value={variations} onValueChange={setVariations}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 font-semibold transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Generate Copy
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {result && result.contents.length > 0 ? (
            result.contents.map((content, idx) => (
              <Card key={idx} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {result.contents.length > 1 ? `Variation ${idx + 1}` : "Generated Result"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm leading-relaxed min-h-[120px]">
                    {content}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyText(content, idx)}
                    className="flex-1"
                  >
                    {copiedIdx === idx ? (
                      <><Check className="mr-2 h-4 w-4" /> Copied!</>
                    ) : (
                      <><Copy className="mr-2 h-4 w-4" /> Copy</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadText(content, idx)}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleGenerate} title="Regenerate">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title="No content yet"
              description="Fill out the details on the left and click Generate to create amazing copy."
            />
          )}
        </div>
      </div>
    </div>
  )
}
