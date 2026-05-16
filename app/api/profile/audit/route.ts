import { NextRequest, NextResponse } from "next/server"
import { profileAudits } from "@/lib/sheets/db"
import { scrapeFiverrProfile } from "@/lib/scraping/fiverr-scraper"
import { auditProfileWithAI } from "@/lib/ai/profile-audit"
import { ai, MODELS } from "@/lib/ai/client"

export const maxDuration = 120

async function extractMetricsFromScreenshot(base64Data: string): Promise<Record<string, string>> {
  try {
    const response = await ai.chat.completions.create({
      model: MODELS.vision,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${base64Data}` },
            },
            {
              type: "text",
              text: "Extract all metrics and numbers from this Fiverr analytics screenshot. Return as JSON object with metric names as keys. Include: orders, revenue, impressions, clicks, conversion rate, response rate, etc.",
            },
          ],
        },
      ],
    })
    const content = response.choices[0]?.message?.content || ""
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {}
  } catch {
    return {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, supplementaryScreenshot } = body

    if (!url) {
      return NextResponse.json({ error: "Profile URL is required" }, { status: 400 })
    }

    // Scrape profile
    const profileData = await scrapeFiverrProfile(url)

    // If screenshot provided, extract additional metrics
    if (supplementaryScreenshot) {
      const base64 = supplementaryScreenshot.replace(/^data:image\/[a-z]+;base64,/, "")
      const metrics = await extractMetricsFromScreenshot(base64)
      Object.assign(profileData, { analyticsMetrics: metrics })
    }

    // Run AI audit
    const auditResult = await auditProfileWithAI(profileData as unknown as Record<string, unknown>)

    // Save to database
    const saved = await profileAudits.insert({
      profile_url: url,
      username: profileData.username,
      overall_score: auditResult.overallScore,
      results: { ...auditResult, profileData },
    })

    return NextResponse.json({
      id: saved?.id,
      ...auditResult,
      profileData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Profile audit error:", error)
    return NextResponse.json({ error: "Audit failed" }, { status: 500 })
  }
}
