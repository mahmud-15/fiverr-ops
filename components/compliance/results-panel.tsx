"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Bot, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface Issue {
  severity: "critical" | "high" | "medium" | "low"
  type: string
  description: string
  quotedText: string
  suggestion: string
  policyRef: string
  source?: string
}

interface ResultsPanelProps {
  issues: Issue[]
}

const severityConfig = {
  critical: {
    label: "Critical",
    badgeVariant: "destructive" as const,
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/5",
    dotColor: "bg-red-500",
  },
  high: {
    label: "High",
    badgeVariant: "destructive" as const,
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-500/5",
    dotColor: "bg-orange-500",
  },
  medium: {
    label: "Medium",
    badgeVariant: "warning" as const,
    borderColor: "border-yellow-500/30",
    bgColor: "bg-yellow-500/5",
    dotColor: "bg-yellow-500",
  },
  low: {
    label: "Low",
    badgeVariant: "secondary" as const,
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/5",
    dotColor: "bg-blue-500",
  },
}

const severityOrder = ["critical", "high", "medium", "low"] as const

export function ResultsPanel({ issues }: ResultsPanelProps) {
  const grouped = severityOrder.reduce(
    (acc, severity) => {
      acc[severity] = issues.filter((i) => i.severity === severity)
      return acc
    },
    {} as Record<string, Issue[]>
  )

  const totalBySeverity = severityOrder.map((s) => ({
    severity: s,
    count: grouped[s].length,
  }))

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-2">
        {totalBySeverity
          .filter((s) => s.count > 0)
          .map(({ severity, count }) => (
            <div
              key={severity}
              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  severityConfig[severity].dotColor
                )}
              />
              <span className="font-medium capitalize">{severity}</span>
              <span className="text-muted-foreground">{count}</span>
            </div>
          ))}
      </div>

      {/* Issues by severity */}
      {severityOrder.map((severity) => {
        const sIssues = grouped[severity]
        if (sIssues.length === 0) return null
        const config = severityConfig[severity]

        return (
          <div key={severity}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {config.label} ({sIssues.length})
            </h3>
            <div className="space-y-3">
              {sIssues.map((issue, index) => (
                <Card
                  key={index}
                  className={cn(
                    "border",
                    config.borderColor,
                    config.bgColor
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={config.badgeVariant} className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-sm font-medium">{issue.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {issue.source === "ai" ? (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Bot className="h-3 w-3" />
                            AI
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Shield className="h-3 w-3" />
                            Rule
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {issue.quotedText && (
                      <div className="rounded bg-background/50 border border-border px-3 py-2">
                        <p className="text-xs font-mono text-foreground/80 break-all">
                          &quot;{issue.quotedText}&quot;
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    <div className="flex items-start gap-2 rounded-md bg-primary/10 border border-primary/20 px-3 py-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-foreground/80">{issue.suggestion}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Policy:</span> {issue.policyRef}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
