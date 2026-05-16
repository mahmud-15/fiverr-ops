import { NextRequest, NextResponse } from "next/server"
import { feedItems } from "@/lib/sheets/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "30")
    const category = searchParams.get("category")

    let all = await feedItems.getAll()

    // Filter by category
    if (category && category !== "all") {
      all = all.filter((item) => item.category === category)
    }

    // Sort by published_at desc, then created_at desc
    all.sort((a, b) => {
      const dateA = a.published_at || a.created_at
      const dateB = b.published_at || b.created_at
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    const total = all.length
    const offset = (page - 1) * limit
    const data = all.slice(offset, offset + limit)

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error("Feed fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_read } = body

    await feedItems.update(id, { is_read })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feed update error:", error)
    return NextResponse.json({ error: "Failed to update feed item" }, { status: 500 })
  }
}
