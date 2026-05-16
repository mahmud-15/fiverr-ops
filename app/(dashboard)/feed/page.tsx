import { FeedList } from "@/components/feed/feed-list"

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Intelligence Feed</h1>
        <p className="text-muted-foreground mt-1">
          Stay up to date with Fiverr policy changes, algorithm updates, and platform news
        </p>
      </div>

      <FeedList />
    </div>
  )
}
