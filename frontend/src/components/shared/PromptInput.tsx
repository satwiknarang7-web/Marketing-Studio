"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PromptInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  suggestions?: string[]
  className?: string
}

export function PromptInput({
  label,
  value,
  onChange,
  placeholder = "Describe what you want to generate...",
  maxLength = 1000,
  suggestions = [],
  className,
}: PromptInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="min-h-[120px] resize-y pb-8"
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {value.length}/{maxLength}
        </div>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(value ? `${value} ${s}` : s)}
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
