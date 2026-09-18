"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = "Generating..." }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-xl border"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold animate-pulse">{message}</h3>
        <p className="text-sm text-muted-foreground mt-2">This might take a moment.</p>
      </motion.div>
    </div>
  )
}
