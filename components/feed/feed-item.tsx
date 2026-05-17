"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Clock, CheckCheck, AlertTriangle, Rss, Zap, TrendingUp, Users, Lightbulb, Globe } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface FeedItemProps {
  item: {
    id: string
    title: string
    summary?: string
    url?: string
    source?: string
    category?: string
    urgency?: string
    published_at?: string
    created_at: string
    is_read: boolean | string
  }
  onMarkRead?: (id: string) => void
}

const categoryConfig: Record<string, {
  icon: React.ElementType
  bg: string
  text: string
  border: string
  dot: string
}> = {
  "Policy Update": {
    icon: AlertTriangle,
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
    dot: "bg-red-500",
  },
  "Algorithm Change": {
    icon: TrendingUp,
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/20",
    dot: "bg-orange-500",
  },
  "New Feature": {
    icon: Zap,
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
  },
  "Industry News": {
    icon: Globe,
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
    dot: "bg-purple-500",
  },
  "Community": {
    icon: Users,
    bg: "bg-green-500/10",
    text: "text-green-500",
    border: "border-green-500/20",
    dot: "bg-green-500",
  },
  "Tips & Strategy": {
    icon: Lightbulb,
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    border: "border-cyan-500/20",
    dot: "bg-cyan-500",
  },
}

const defaultConfig = {
  icon: Rss,
  bg: "bg-secondary",
  text: "text-muted-foreground",
  border: "border-border",
  dot: "bg-muted-foreground",
}

// Sheets stores booleans as strings — convert safely
function isTrue(val: boolean | string | undefined): boolean {
  return val === true || String(val).toLowerCase() === "true"
}

export function FeedItem({ item, onMarkRead }: FeedItemProps) {
  const [isRead, setIsRead] = useState(isTrue(item.is_read))
  const [marking, setMarking] = useState(false)

  async function handleMarkRead() {
    setMarking(true)
    try {
      await fetch("/api/feed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_read: true }),
      })
      setIsRead(true)
      onMarkRead?.(item.id)
    } catch {
      // silent
    } finally {
      setMarking(false)
    }
  }

  const config = item.category ? (categoryConfig[item.category] || defaultConfig) : defaultConfig
  const Icon = config.icon
  const date = item.published_at || item.created_at
  const isUrgent = item.urgency === "urgent"

  return (
    <Card className={cn(
      "group transition-all duration-200 hover:shadow-md overflow-hidden",
      isRead ? "opacity-70" : "border-border",
      isUrgent && !isRead ? "border-red-500/40" : ""
    )}>
      {/* Urgent top bar */}
      {isUrgent && !isRead && (
        <div className="h-0.5 bg-gradient-to-r from-red-500 to-orange-500" />
      )}

      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          {/* Category icon */}
          <div className={cn(
            "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border",
            config.bg, config.border
          )}>
            <Icon className={cn("h-4 w-4 sm:h-5 sm:h-5", config.text)} />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {/* Title row */}
            <div className="flex items-start gap-2">
              <h3 className={cn(
                "text-sm sm:text-base font-semibold leading-snug flex-1",
                isRead ? "text-muted-foreground" : "text-foreground"
              )}>
                {item.title}
              </h3>
              {!isRead && (
                <span className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", config.dot)} />
              )}
            </div>

            {/* Summary */}
            {item.summary && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category pill */}
              {item.category && (
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                  config.bg, config.text, config.border
                )}>
                  <Icon className="h-3 w-3" />
                  {item.category}
                </span>
              )}

              {/* Urgent badge */}
              {isUrgent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-xs font-medium text-red-500">
                  <AlertTriangle className="h-3 w-3" />
                  Urgent
                </span>
              )}

              {/* Source */}
              {item.source && (
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {item.source}
                </span>
              )}

              {/* Time */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                <Clock className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">{formatDateTime(date)}</span>
                <span className="sm:hidden">{new Date(date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              {item.url && (
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                    Read full article
                  </a>
                </Button>
              )}
              {!isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={handleMarkRead}
                  disabled={marking}
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark read
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
