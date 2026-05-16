"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"
import { BarChart2 } from "lucide-react"

interface HistoryItem {
  id: string
  created_at: string
  profile_url: string
  username?: string
  overall_score?: number
}

export function AuditHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/profile/history?limit=10")
        const data = await res.json()
        setHistory(data.data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <BarChart2 className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No audits yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {history.map((item) => (
        <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">{item.username || item.profile_url}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</p>
          </div>
          {item.overall_score != null && (
            <Badge
              variant={
                item.overall_score >= 75 ? "success" : item.overall_score >= 50 ? "warning" : "destructive"
              }
              className="text-sm font-bold"
            >
              {item.overall_score}
            </Badge>
          )}
        </div>
      ))}
    </div>
  )
}
