"use client"

import { useState, useEffect } from "react"
import { FeedItem } from "./feed-item"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Rss, Loader2 } from "lucide-react"

const categories = [
  { value: "all", label: "All" },
  { value: "Policy Update", label: "Policy" },
  { value: "Algorithm Change", label: "Algorithm" },
  { value: "New Feature", label: "Features" },
  { value: "Industry News", label: "Industry" },
  { value: "Community", label: "Community" },
  { value: "Tips & Strategy", label: "Tips" },
]

interface FeedItemData {
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

export function FeedList() {
  const [items, setItems] = useState<FeedItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const { toast } = useToast()

  async function fetchFeed(category: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== "all") params.set("category", category)
      const res = await fetch(`/api/feed?${params}`)
      const data = await res.json()
      setItems(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed(activeCategory)
  }, [activeCategory])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch("/api/feed/refresh", { method: "POST" })
      const data = await res.json()
      toast({
        title: "Feed refreshed",
        description: data.message || "Feed updated.",
      })
      await fetchFeed(activeCategory)
    } catch {
      toast({ title: "Refresh failed", variant: "destructive" })
    } finally {
      setRefreshing(false)
    }
  }

  const handleMarkRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    )
  }

  const unreadCount = items.filter((i) => !i.is_read).length

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh Feed
        </Button>
      </div>

      {/* Category filter */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Rss className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-medium">No feed items yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Click &quot;Refresh Feed&quot; to fetch the latest Fiverr news</p>
          <Button className="mt-4" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh Feed
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <FeedItem key={item.id} item={item} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  )
}
