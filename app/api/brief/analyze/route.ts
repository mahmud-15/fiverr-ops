import { NextRequest, NextResponse } from "next/server"
import { briefAnalyses } from "@/lib/sheets/db"
import { analyzeBrief } from "@/lib/ai/brief-analyzer"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { briefText } = body

    if (!briefText?.trim()) {
      return NextResponse.json({ error: "Brief text is required" }, { status: 400 })
    }

    const analysis = await analyzeBrief(briefText)

    // Save to database
    const saved = await briefAnalyses.insert({
      original_brief: briefText.slice(0, 10000),
      analysis: analysis as unknown as Record<string, unknown>,
    })

    return NextResponse.json({
      id: saved?.id,
      analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Brief analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
