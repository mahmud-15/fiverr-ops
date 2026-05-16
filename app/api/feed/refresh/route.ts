import { NextResponse } from "next/server"
import { feedItems } from "@/lib/sheets/db"
import { fetchFeedItems } from "@/lib/feed/sources"
import { processFeedItems } from "@/lib/ai/feed-processor"

export const maxDuration = 120

export async function POST() {
  try {
    const rawItems = await fetchFeedItems()

    if (rawItems.length === 0) {
      return NextResponse.json({ message: "No new items found", added: 0 })
    }

    // Process with AI
    const processedItems = await processFeedItems(rawItems)

    // Deduplicate against existing items
    const existing = await feedItems.getAll()
    const existingUrls = new Set(existing.map((i) => i.url).filter(Boolean))
    const newItems = processedItems.filter((i) => i.url && !existingUrls.has(i.url))

    if (newItems.length === 0) {
      return NextResponse.json({ message: "All items already exist", added: 0 })
    }

    // Insert new items
    await feedItems.bulkInsert(
      newItems.map((item) => ({
        title: item.title,
        summary: item.summary,
        url: item.url,
        source: item.source,
        category: item.category,
        urgency: item.urgency,
        published_at: item.publishedAt || "",
        raw_content: (item.rawContent || "").slice(0, 5000),
        is_read: false,
      }))
    )

    return NextResponse.json({
      message: `Added ${newItems.length} new items`,
      added: newItems.length,
    })
  } catch (error) {
    console.error("Feed refresh error:", error)
    return NextResponse.json({ error: "Failed to refresh feed" }, { status: 500 })
  }
}
