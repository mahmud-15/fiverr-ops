import { NextResponse } from "next/server"
import { fiverrUpdates } from "@/lib/sheets/db"
import { fetchFiverrLatestContext } from "@/lib/feed/fiverr-updates-fetcher"
import { generateFiverrUpdates } from "@/lib/ai/fiverr-updates"

export const maxDuration = 60

export async function POST() {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Clear today's existing data
    await fiverrUpdates.clearDate(today)

    // Fetch context from the web
    const context = await fetchFiverrLatestContext()

    // Generate updates with AI
    const generated = await generateFiverrUpdates(context)

    // Save news items
    await fiverrUpdates.bulkInsert(
      generated.news.map((item) => ({
        date: today,
        type: "news" as const,
        title: item.title,
        content: item.content,
        source: item.source,
        urgency: item.urgency,
        tags: item.tags,
      }))
    )

    // Save seller tips
    await fiverrUpdates.bulkInsert(
      generated.sellerTips.map((item) => ({
        date: today,
        type: "seller_tip" as const,
        title: item.title,
        content: item.content,
        source: "",
        urgency: "normal" as const,
        tags: item.tags,
      }))
    )

    // Save profile tips
    await fiverrUpdates.bulkInsert(
      generated.profileTips.map((item) => ({
        date: today,
        type: "profile_tip" as const,
        title: item.title,
        content: item.content,
        source: "",
        urgency: "normal" as const,
        tags: item.tags,
      }))
    )

    return NextResponse.json({
      success: true,
      counts: {
        news: generated.news.length,
        sellerTips: generated.sellerTips.length,
        profileTips: generated.profileTips.length,
      },
    })
  } catch (error) {
    console.error("Fiverr updates refresh error:", error)
    return NextResponse.json({ error: "Failed to refresh fiverr updates" }, { status: 500 })
  }
}
