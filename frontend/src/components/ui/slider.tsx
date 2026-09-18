"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (val: number[]) => void
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [1.8], min = 1, max = 10, step = 0.1, onValueChange, ...props }, ref) => {
    const currentVal = value[0] ?? min

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentVal}
          onChange={(e) => onValueChange?.([parseFloat(e.target.value)])}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"
