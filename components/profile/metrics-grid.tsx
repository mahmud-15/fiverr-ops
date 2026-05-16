"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface CategoryScore {
  score: number
  label: string
  details: string[]
  color: "green" | "yellow" | "red"
}

interface MetricsGridProps {
  categories: {
    accountHealth: CategoryScore
    gigOptimization: CategoryScore
    profileStrength: CategoryScore
    reviewAnalysis: CategoryScore
    riskIndicators: CategoryScore
  }
}

const categoryLabels = {
  accountHealth: "Account Health",
  gigOptimization: "Gig Optimization",
  profileStrength: "Profile Strength",
  reviewAnalysis: "Review Analysis",
  riskIndicators: "Risk Indicators",
}

const colorClasses = {
  green: {
    text: "text-green-500",
    progress: "bg-green-500",
    badge: "bg-green-500/10 text-green-500",
  },
  yellow: {
    text: "text-yellow-500",
    progress: "bg-yellow-500",
    badge: "bg-yellow-500/10 text-yellow-500",
  },
  red: {
    text: "text-red-500",
    progress: "bg-red-500",
    badge: "bg-red-500/10 text-red-500",
  },
}

export function MetricsGrid({ categories }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.entries(categories) as [keyof typeof categories, CategoryScore][]).map(
        ([key, category]) => {
          const colors = colorClasses[category.color]
          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {categoryLabels[key]}
                  </CardTitle>
                  <span className={cn("text-xl font-bold", colors.text)}>
                    {category.score}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Progress
                    value={category.score}
                    className="h-2"
                  />
                  <div className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", colors.badge)}>
                    {category.label}
                  </div>
                </div>
                {category.details.length > 0 && (
                  <ul className="space-y-1">
                    {category.details.slice(0, 3).map((detail, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                        <span className="shrink-0 mt-0.5">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        }
      )}
    </div>
  )
}
