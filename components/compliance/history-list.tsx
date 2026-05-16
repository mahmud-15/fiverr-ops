"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/utils"
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"

interface HistoryItem {
  id: string
  created_at: string
  verdict: string
  issues_count: number
  input_text?: string
}

export function ComplianceHistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/compliance/history?limit=20")
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
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No compliance checks yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {history.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            {item.verdict === "SAFE" ? (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            ) : item.verdict === "UNSAFE" ? (
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    item.verdict === "SAFE"
                      ? "success"
                      : item.verdict === "UNSAFE"
                      ? "destructive"
                      : "warning"
                  }
                  className="text-xs"
                >
                  {item.verdict}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {item.issues_count} issue{item.issues_count !== 1 ? "s" : ""}
                </span>
              </div>
              {item.input_text && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                  {item.input_text.slice(0, 60)}...
                </p>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDateTime(item.created_at)}
          </span>
        </div>
      ))}
    </div>
  )
}
