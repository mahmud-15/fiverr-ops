"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Clock, CheckCircle } from "lucide-react"
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
    is_read: boolean
  }
  onMarkRead?: (id: string) => void
}

const urgencyColors = {
  urgent: "destructive" as const,
  normal: "secondary" as const,
  low: "outline" as const,
}

const categoryColors: Record<string, string> = {
  "Policy Update": "bg-red-500/10 text-red-400 border-red-500/20",
  "Algorithm Change": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "New Feature": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Industry News": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Community": "bg-green-500/10 text-green-400 border-green-500/20",
  "Tips & Strategy": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
}

export function FeedItem({ item, onMarkRead }: FeedItemProps) {
  const [isRead, setIsRead] = useState(item.is_read)

  async function handleMarkRead() {
    try {
      await fetch("/api/feed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_read: true }),
      })
      setIsRead(true)
      onMarkRead?.(item.id)
    } catch (error) {
      console.error("Mark read error:", error)
    }
  }

  const date = item.published_at || item.created_at
  const categoryStyle = item.category ? categoryColors[item.category] || "bg-secondary text-muted-foreground" : ""

  return (
    <Card className={cn(
      "transition-all",
      isRead ? "opacity-60" : "border-border"
    )}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "text-sm font-medium leading-snug",
                isRead ? "text-muted-foreground" : "text-foreground"
              )}>
                {item.title}
              </h3>
              {!isRead && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
              )}
            </div>

            {item.summary && (
              <p className="text-xs text-muted-foreground line-clamp-3">{item.summary}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {item.category && (
                <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", categoryStyle)}>
                  {item.category}
                </span>
              )}
              {item.urgency && item.urgency !== "normal" && (
                <Badge variant={urgencyColors[item.urgency as keyof typeof urgencyColors] || "secondary"} className="text-xs">
                  {item.urgency}
                </Badge>
              )}
              {item.source && (
                <span className="text-xs text-muted-foreground">{item.source}</span>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDateTime(date)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {item.url && (
            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                Read more
              </a>
            </Button>
          )}
          {!isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkRead}
            >
              <CheckCircle className="h-3 w-3" />
              Mark read
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
