"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  TrendingUp,
  RefreshCw,
  Loader2,
  Lightbulb,
  Zap,
  Newspaper,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FiverrUpdate {
  id: string
  created_at: string
  date: string
  type: "news" | "seller_tip" | "profile_tip"
  title: string
  content: string
  source?: string
  urgency: "urgent" | "normal" | "low"
  tags: string[]
}

function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="py-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function UrgencyBadge({ urgency }: { urgency: "urgent" | "normal" | "low" }) {
  if (urgency === "normal") return null
  return (
    <Badge
      variant={urgency === "urgent" ? "destructive" : "outline"}
      className="text-xs capitalize"
    >
      {urgency}
    </Badge>
  )
}

function TagList({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

function NewsCard({ item }: { item: FiverrUpdate }) {
  return (
    <Card
      className={cn(
        "transition-all",
        item.urgency === "urgent" && "border-l-4 border-l-destructive"
      )}
    >
      <CardContent className="py-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug flex-1">{item.title}</h3>
          <UrgencyBadge urgency={item.urgency} />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {item.source && (
            <Badge variant="secondary" className="text-xs">
              {item.source}
            </Badge>
          )}
        </div>
        <TagList tags={item.tags} />
      </CardContent>
    </Card>
  )
}

function SellerTipCard({ item, index }: { item: FiverrUpdate; index: number }) {
  return (
    <Card className="transition-all hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <Lightbulb className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">Tip #{index + 1}</span>
        </div>
        <CardTitle className="text-sm font-semibold leading-snug mt-1">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
        <TagList tags={item.tags} />
      </CardContent>
    </Card>
  )
}

function ProfileTipCard({ item, index }: { item: FiverrUpdate; index: number }) {
  return (
    <Card className="transition-all hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 text-green-500 shrink-0">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">Tip #{index + 1}</span>
        </div>
        <CardTitle className="text-sm font-semibold leading-snug mt-1">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
        <div className="mt-2 rounded-md bg-green-500/10 border border-green-500/20 px-3 py-1.5">
          <p className="text-xs font-medium text-green-600 dark:text-green-400">Apply this tip to optimize your profile</p>
        </div>
        <TagList tags={item.tags} />
      </CardContent>
    </Card>
  )
}

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <TrendingUp className="h-10 w-10 text-muted-foreground mb-3" />
      <h3 className="font-medium">No updates for today yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Generate today&apos;s curated Fiverr news, seller tips, and profile optimization insights.
      </p>
      <Button className="mt-4" onClick={onGenerate} disabled={generating}>
        {generating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Generate Today&apos;s Updates
      </Button>
    </div>
  )
}

export function FiverrUpdatesPage() {
  const [updates, setUpdates] = useState<FiverrUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const fetchUpdates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/fiverr-updates")
      const data = await res.json()
      return { updates: (data.data || []) as FiverrUpdate[], fresh: data.fresh as boolean }
    } catch (error) {
      console.error("fetchUpdates error:", error)
      return { updates: [], fresh: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/fiverr-updates/refresh", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Updates refreshed",
          description: `Fetched ${data.counts?.news ?? 0} news, ${data.counts?.sellerTips ?? 0} seller tips, ${data.counts?.profileTips ?? 0} profile tips.`,
        })
        const result = await fetchUpdates()
        setUpdates(result.updates)
      } else {
        throw new Error(data.error || "Unknown error")
      }
    } catch (error) {
      console.error("handleRefresh error:", error)
      toast({ title: "Refresh failed", description: "Could not generate updates. Please try again.", variant: "destructive" })
    } finally {
      setRefreshing(false)
    }
  }, [fetchUpdates, toast])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const result = await fetchUpdates()
      if (cancelled) return

      if (!result.fresh || result.updates.length === 0) {
        // Auto-trigger refresh
        setUpdates([])
        setLoading(false)
        // Kick off background refresh
        setRefreshing(true)
        try {
          const res = await fetch("/api/fiverr-updates/refresh", { method: "POST" })
          const data = await res.json()
          if (!cancelled && data.success) {
            const refetched = await fetchUpdates()
            if (!cancelled) setUpdates(refetched.updates)
          }
        } catch (error) {
          console.error("Auto-refresh error:", error)
        } finally {
          if (!cancelled) setRefreshing(false)
        }
      } else {
        setUpdates(result.updates)
      }
    }

    init()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const newsItems = updates.filter((u) => u.type === "news")
  const sellerTips = updates.filter((u) => u.type === "seller_tip")
  const profileTips = updates.filter((u) => u.type === "profile_tip")

  const isGenerating = refreshing && updates.length === 0

  return (
    <div className="animate-fade-in space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-md glow-primary">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">Fiverr Updates</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Daily news, seller tips &amp; profile optimization insights</p>
            <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh Today&apos;s Updates
        </Button>
      </div>

      {/* Content */}
      {loading || isGenerating ? (
        <div className="space-y-4">
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating today&apos;s updates with AI...
            </div>
          )}
          <SkeletonCards count={5} />
        </div>
      ) : updates.length === 0 ? (
        <EmptyState onGenerate={handleRefresh} generating={refreshing} />
      ) : (
        <Tabs defaultValue="news">
          <TabsList className="mb-4">
            <TabsTrigger value="news" className="gap-1.5">
              <Newspaper className="h-3.5 w-3.5" />
              Latest News
              {newsItems.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
                  {newsItems.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="seller-tips" className="gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              Seller Tips
              {sellerTips.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
                  {sellerTips.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile-tips" className="gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Profile Tips
              {profileTips.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
                  {profileTips.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            {newsItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No news items available.</p>
            ) : (
              <div className="space-y-3">
                {newsItems.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="seller-tips">
            {sellerTips.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No seller tips available.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {sellerTips.map((item, i) => (
                  <SellerTipCard key={item.id} item={item} index={i} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile-tips">
            {profileTips.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No profile tips available.</p>
            ) : (
              <div className="space-y-3">
                {profileTips.map((item, i) => (
                  <ProfileTipCard key={item.id} item={item} index={i} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
