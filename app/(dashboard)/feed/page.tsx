import { FeedList } from "@/components/feed/feed-list"
import { Rss, Globe, TrendingUp } from "lucide-react"

export default function FeedPage() {
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md" style={{ boxShadow: "0 0 20px hsl(142 71% 45% / 0.25)" }}>
          <Rss className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Intelligence Feed</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time Fiverr news, policy updates &amp; platform changes
          </p>
        </div>
      </div>

      {/* Source badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Sources:</span>
        {[
          { label: "Fiverr Blog", icon: Globe },
          { label: "Reddit r/fiverr", icon: TrendingUp },
          { label: "Web Search", icon: Rss },
        ].map(({ label, icon: Icon }) => (
          <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border px-2.5 py-1 text-xs text-muted-foreground">
            <Icon className="h-3 w-3" />
            {label}
          </span>
        ))}
      </div>

      <FeedList />
    </div>
  )
}
