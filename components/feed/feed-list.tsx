"use client"

import { useState, useEffect, useMemo } from "react"
import { FeedItem } from "./feed-item"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  RefreshCw, Rss, Loader2, AlertTriangle, TrendingUp,
  Zap, Globe, Users, Lightbulb, LayoutList
} from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  { value: "all", label: "All", icon: LayoutList, color: "text-foreground" },
  { value: "Policy Update", label: "Policy", icon: AlertTriangle, color: "text-red-500" },
  { value: "Algorithm Change", label: "Algorithm", icon: TrendingUp, color: "text-orange-500" },
  { value: "New Feature", label: "Features", icon: Zap, color: "text-blue-500" },
  { value: "Industry News", label: "Industry", icon: Globe, color: "text-purple-500" },
  { value: "Community", label: "Community", icon: Users, color: "text-green-500" },
  { value: "Tips & Strategy", label: "Tips", icon: Lightbulb, color: "text-cyan-500" },
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
  is_read: boolean | string
}

// Safely check if a value from Sheets means "true"
function isTrue(val: boolean | string | undefined): boolean {
  return val === true || String(val).toLowerCase() === "true"
}

// Normalise category string for comparison
function normCat(s: string) {
  return s.toLowerCase().trim()
}

export function FeedList() {
  const [allItems, setAllItems] = useState<FeedItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const { toast } = useToast()

  async function fetchFeed() {
    setLoading(true)
    try {
      // Always fetch all — filter client-side for reliability
      const res = await fetch("/api/feed?limit=100")
      const data = await res.json()
      setAllItems(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFeed() }, [])

  const handleMarkRead = (id: string) => {
    setAllItems(prev => prev.map(item => item.id === id ? { ...item, is_read: true } : item))
  }

  // Client-side category filter
  const items = useMemo(() => {
    if (activeCategory === "all") return allItems
    return allItems.filter(i =>
      normCat(i.category || "") === normCat(activeCategory)
    )
  }, [allItems, activeCategory])

  // Counts from full list (always accurate)
  const categoryCounts = useMemo(() => {
    return categories.slice(1).reduce((acc, cat) => {
      acc[cat.value] = allItems.filter(i =>
        normCat(i.category || "") === normCat(cat.value)
      ).length
      return acc
    }, {} as Record<string, number>)
  }, [allItems])

  const unreadCount = allItems.filter(i => !isTrue(i.is_read)).length
  const urgentCount = allItems.filter(i => i.urgency === "urgent" && !isTrue(i.is_read)).length

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const res = await fetch("/api/feed/refresh", { method: "POST" })
      const data = await res.json()
      toast({ title: "Feed refreshed", description: data.message || "Latest Fiverr news loaded." })
      await fetchFeed()
    } catch {
      toast({ title: "Refresh failed", variant: "destructive" })
    } finally {
      setRefreshing(false)
    }
  }

  const urgentUnread = items.filter(i => i.urgency === "urgent" && !isTrue(i.is_read))
  const rest = items.filter(i => !(i.urgency === "urgent" && !isTrue(i.is_read) && activeCategory === "all"))

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold mt-0.5">{allItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground">Unread</p>
            <p className="text-2xl font-bold mt-0.5 text-primary">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground">Urgent</p>
            <p className={cn("text-2xl font-bold mt-0.5", urgentCount > 0 ? "text-red-500" : "")}>{urgentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Refresh</p>
              <p className="text-xs text-muted-foreground mt-0.5">Get latest news</p>
            </div>
            <Button size="sm" onClick={handleRefresh} disabled={refreshing} className="shrink-0">
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Category filter tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => {
            const Icon = cat.icon
            const count = cat.value === "all" ? allItems.length : (categoryCounts[cat.value] || 0)
            const isActive = activeCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all whitespace-nowrap border cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary-foreground" : cat.color)} />
                {cat.label}
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  isActive
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Feed items */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <Rss className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">
              {allItems.length > 0 ? `No items in "${activeCategory}"` : "No feed items yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {allItems.length > 0
                ? "Try a different category tab"
                : "Click Refresh to fetch the latest Fiverr news, policy updates, and platform changes"
              }
            </p>
            {allItems.length === 0 && (
              <Button className="mt-5" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Fetch Latest News
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Urgent section */}
          {urgentUnread.length > 0 && activeCategory === "all" && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 px-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Urgent — Action Required
              </p>
              {urgentUnread.map(item => (
                <FeedItem key={item.id} item={item} onMarkRead={handleMarkRead} />
              ))}
              {rest.length > 0 && (
                <div className="border-t border-border/50 pt-3">
                  <p className="text-xs text-muted-foreground px-1 pb-2 font-medium">All items</p>
                </div>
              )}
            </div>
          )}
          {rest.map(item => (
            <FeedItem key={item.id} item={item} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  )
}
