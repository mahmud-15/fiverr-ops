import { NextRequest, NextResponse } from "next/server"
import { kbArticles } from "@/lib/sheets/db"
import { ai, MODELS } from "@/lib/ai/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const articles = await kbArticles.getAll()

    if (!articles || articles.length === 0) {
      return NextResponse.json({ results: [], answer: "No articles found in the knowledge base." })
    }

    const articleSummaries = articles
      .map((a, i) => `[${i}] ${a.title}: ${String(a.content || "").slice(0, 300)}`)
      .join("\n\n")

    const response = await ai.chat.completions.create({
      model: MODELS.fast,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: "You are a Fiverr knowledge base search assistant. Find the most relevant articles for the given query and provide a direct answer.",
        },
        {
          role: "user",
          content: `Query: "${query}"\n\nKnowledge base articles:\n${articleSummaries}\n\nReturn JSON: { "relevantIndices": [indices max 5], "answer": "direct answer" }. Return ONLY valid JSON.`,
        },
      ],
    })

    const content = response.choices[0]?.message?.content || ""
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ results: articles.slice(0, 5), answer: "" })
    }

    const parsed = JSON.parse(jsonMatch[0])
    const relevantArticles = (parsed.relevantIndices || [])
      .filter((i: number) => i >= 0 && i < articles.length)
      .map((i: number) => articles[i])

    return NextResponse.json({
      results: relevantArticles.length > 0 ? relevantArticles : articles.slice(0, 5),
      answer: parsed.answer || "",
    })
  } catch (error) {
    console.error("KB search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
