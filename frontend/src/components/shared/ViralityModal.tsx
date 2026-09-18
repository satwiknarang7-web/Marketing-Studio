"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, CheckCircle, AlertCircle, Lightbulb, Zap } from "lucide-react"
import type { ViralityScoreResponse } from "@/types"

interface ViralityModalProps {
  isOpen: boolean
  onClose: () => void
  data: ViralityScoreResponse | null
  isLoading?: boolean
}

export function ViralityModal({ isOpen, onClose, data, isLoading }: ViralityModalProps) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <DialogTitle className="text-xl">Higgsfield Virality Predictor</DialogTitle>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
              AI Analysis
            </Badge>
          </div>
          <DialogDescription>
            Predictive engagement and retention scoring for short-form marketing video ads.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Zap className="h-10 w-10 text-blue-500 animate-pulse" />
            <p className="text-sm font-medium text-muted-foreground">
              Analyzing hook retention, visual pacing, and emotional triggers...
            </p>
          </div>
        ) : data ? (
          <div className="space-y-6 pt-2">
            {/* Top Score Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-center">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Virality Score</span>
                <div className="text-3xl font-extrabold text-blue-500 dark:text-blue-400 mt-1">
                  {data.virality_score}
                  <span className="text-sm font-normal text-muted-foreground">/100</span>
                </div>
                <Badge className="mt-2 text-xs border-blue-500/30 text-blue-400" variant="outline">
                  {data.engagement_potential}
                </Badge>
              </div>

              <div className="p-4 rounded-xl border bg-muted/30 text-center">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Hook (0-3s)</span>
                <div className="text-3xl font-extrabold text-foreground mt-1">
                  {data.hook_score}
                  <span className="text-sm font-normal text-muted-foreground">/100</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">First Frame Grip</p>
              </div>

              <div className="p-4 rounded-xl border bg-muted/30 text-center">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Retention</span>
                <div className="text-3xl font-extrabold text-foreground mt-1">
                  {data.retention_score}
                  <span className="text-sm font-normal text-muted-foreground">/100</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Completion Likelihood</p>
              </div>
            </div>

            {/* Platform Breakdown */}
            <div className="p-4 rounded-xl border bg-card space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Platform Fit Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(data.platform_breakdown).map(([platform, score]) => (
                  <div key={platform} className="p-2.5 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs font-medium text-muted-foreground truncate">
                      {platform.replace(/_/g, " ")}
                    </p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{score}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 space-y-2">
                <h4 className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 uppercase">
                  <CheckCircle className="h-4 w-4" /> Visual Strengths
                </h4>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  {data.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-sky-500">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase">
                  <AlertCircle className="h-4 w-4" /> Drop-off Risks
                </h4>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  {data.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2">
              <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase">
                <Lightbulb className="h-4 w-4" /> Actionable Improvements
              </h4>
              <ul className="text-xs space-y-1.5 text-foreground/90">
                {data.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">{i + 1}.</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
