"use client"

import { useEffect, useState, useRef } from "react"
import { Zap, X, ExternalLink, AlertTriangle, TrendingUp, Lightbulb, Globe, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeadlineItem {
  id: string
  title: string
  content?: string
  summary?: string
  category?: string
  urgency?: string
  source?: string
  url?: string
  published_at?: string
  created_at?: string
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  "Policy Update":     { icon: AlertTriangle, color: "text-red-500",    bg: "bg-red-500/10",    border: "border-red-500/20" },
  "Algorithm Change":  { icon: TrendingUp,    color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  "New Feature":       { icon: Zap,           color: "text-blue-500",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  "Industry News":     { icon: Globe,         color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  "Community":         { icon: Users,         color: "text-green-500",  bg: "bg-green-500/10",  border: "border-green-500/20" },
  "Tips & Strategy":   { icon: Lightbulb,     color: "text-cyan-500",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20" },
  "news":              { icon: Globe,         color: "text-blue-500",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  "seller_tip":        { icon: Lightbulb,     color: "text-cyan-500",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20" },
  "profile_tip":       { icon: TrendingUp,    color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
}

const defaultConfig = { icon: Zap, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" }

function formatDate(dateStr?: string) {
  if (!dateStr) return ""
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  } catch { return "" }
}

function NewsModal({ item, onClose }: { item: HeadlineItem; onClose: () => void }) {
  const cfg = categoryConfig[item.category || ""] || defaultConfig
  const Icon = cfg.icon
  const dateStr = item.published_at || item.created_at
  const bodyText = item.content || item.summary || ""

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-scale-in glass rounded-2xl border border-border/60 shadow-2xl overflow-hidden">
        {/* Urgency bar */}
        {item.urgency === "urgent" && (
          <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        )}

        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-border/50">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", cfg.bg, cfg.border)}>
            <Icon className={cn("h-5 w-5", cfg.color)} />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            {item.category && (
              <span className={cn("text-xs font-semibold uppercase tracking-wide", cfg.color)}>
                {item.category}
              </span>
            )}
            <h2 className="text-sm sm:text-base font-bold text-foreground leading-snug mt-0.5">
              {item.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {bodyText ? (
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {bodyText}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No details available for this item.</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-border/50">
            {item.source && (
              <span className="text-xs text-muted-foreground">{item.source}</span>
            )}
            {dateStr && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDate(dateStr)}
              </div>
            )}
            {item.urgency && item.urgency !== "normal" && (
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                item.urgency === "urgent"
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : "bg-secondary text-muted-foreground border-border"
              )}>
                {item.urgency === "urgent" && <AlertTriangle className="h-3 w-3" />}
                {item.urgency}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border/50 bg-secondary/20">
          <p className="text-xs text-muted-foreground">From Fiverr Updates</p>
          <div className="flex items-center gap-2">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Read original
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NewsTicker() {
  const [headlines, setHeadlines] = useState<HeadlineItem[]>([])
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const [selectedItem, setSelectedItem] = useState<HeadlineItem | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fiverr-updates")
        const data = await res.json()
        const items: HeadlineItem[] = (data.data || []).filter((i: HeadlineItem) => i.title)
        if (items.length > 0) { setHeadlines(items); return }

        const feedRes = await fetch("/api/feed?limit=30")
        const feedData = await feedRes.json()
        const feedItems: HeadlineItem[] = (feedData.data || []).filter((i: HeadlineItem) => i.title)
        setHeadlines(feedItems)
      } catch { /* silent */ }
    }
    load()
  }, [])

  useEffect(() => {
    if (headlines.length <= 1) return
    intervalRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % headlines.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [headlines])

  if (headlines.length === 0) return <div className="flex-1" />

  const headline = headlines[current]

  return (
    <>
      <div className="hidden sm:flex flex-1 items-center gap-2 min-w-0 mx-4">
        {/* LIVE badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-wide whitespace-nowrap">
            <Zap className="h-3 w-3" />
            Live
          </span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border shrink-0" />

        {/* Headline — click opens modal */}
        <button
          onClick={() => setSelectedItem(headline)}
          className="flex-1 min-w-0 text-left group"
          title="Click to view details"
        >
          <p
            className="text-xs sm:text-sm text-foreground/80 group-hover:text-primary truncate cursor-pointer group-hover:underline underline-offset-2"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(-6px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            {headline.title}
          </p>
        </button>
      </div>

      {/* Detail modal */}
      {selectedItem && (
        <NewsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  )
}
