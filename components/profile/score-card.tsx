"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ScoreCardProps {
  score: number
  profileName: string
}

export function ScoreCard({ score, profileName }: ScoreCardProps) {
  const color = score >= 75 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"
  const bgColor = score >= 75 ? "bg-green-500/10" : score >= 50 ? "bg-yellow-500/10" : "bg-red-500/10"
  const label = score >= 75 ? "Excellent" : score >= 50 ? "Needs Work" : "Critical Issues"

  // SVG circle progress
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <Card>
      <CardContent className="flex items-center gap-6 py-6">
        {/* Circular progress */}
        <div className="relative shrink-0">
          <svg width="140" height="140" className="-rotate-90">
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-secondary"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-700",
                score >= 75 ? "stroke-green-500" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500"
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold", color)}>{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div>
            <h2 className="text-xl font-bold">{profileName}</h2>
            <p className="text-sm text-muted-foreground">Overall Profile Score</p>
          </div>
          <div className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium", bgColor, color)}>
            {label}
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            {score >= 75
              ? "Your profile is well-optimized. Focus on maintaining and small improvements."
              : score >= 50
              ? "Your profile has room for improvement. Address the action items below."
              : "Your profile needs significant work. Prioritize the urgent action items."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
