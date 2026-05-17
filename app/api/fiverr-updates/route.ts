import { NextResponse } from "next/server"
import { fiverrUpdates } from "@/lib/sheets/db"

export async function GET() {
  try {
    const data = await fiverrUpdates.getToday()

    if (!data || data.length === 0) {
      return NextResponse.json({ data: [], fresh: false })
    }

    return NextResponse.json({ data, fresh: true })
  } catch (error) {
    console.error("Fiverr updates GET error:", error)
    return NextResponse.json({ error: "Failed to fetch fiverr updates" }, { status: 500 })
  }
}
