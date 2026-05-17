import { NextRequest, NextResponse } from "next/server"
import { briefAnalyses, kbArticles } from "@/lib/sheets/db"
import { analyzeBrief } from "@/lib/ai/brief-analyzer"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { briefText } = body

    if (!briefText?.trim()) {
      return NextResponse.json({ error: "Brief text is required" }, { status: 400 })
    }

    // Fetch relevant KB articles for context
    const allArticles = await kbArticles.getAll()
    const pricingArticles = allArticles.filter(
      (a) => a.category === "Pricing" || a.category === "Quotation"
    )
    const kbContext = pricingArticles
      .slice(0, 5)
      .map((a) => `**${a.title}**\n${String(a.content).slice(0, 500)}`)
      .join("\n\n---\n\n")

    const analysis = await analyzeBrief(briefText, kbContext || undefined)

    // Save to database
    const saved = await briefAnalyses.insert({
      original_brief: briefText.slice(0, 10000),
      analysis: analysis as unknown as Record<string, unknown>,
    })

    return NextResponse.json({
      id: saved?.id,
      analysis,
      timestamp: new Date().toISOString(),
      kbArticlesUsed: pricingArticles.length,
    })
  } catch (error) {
    console.error("Brief analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
