import { NextRequest, NextResponse } from "next/server"
import { complianceChecks } from "@/lib/sheets/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const all = await complianceChecks.getAll()
    // Sort by created_at descending
    const sorted = all.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const total = sorted.length
    const offset = (page - 1) * limit
    const data = sorted.slice(offset, offset + limit)

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error("Compliance history error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
