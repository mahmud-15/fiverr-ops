import { NextRequest, NextResponse } from "next/server"
import { profileAudits } from "@/lib/sheets/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const all = await profileAudits.getAll()
    const sorted = all.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const total = sorted.length
    const offset = (page - 1) * limit
    // Return only summary fields
    const data = sorted.slice(offset, offset + limit).map((a) => ({
      id: a.id,
      created_at: a.created_at,
      profile_url: a.profile_url,
      username: a.username,
      overall_score: a.overall_score,
    }))

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error("Profile history error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
