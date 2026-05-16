import { ai, MODELS } from "./client"

export interface RawFeedItem {
  title: string
  url: string
  source: string
  publishedAt?: string
  rawContent?: string
}

export interface ProcessedFeedItem extends RawFeedItem {
  category: string
  summary: string
  urgency: "urgent" | "normal" | "low"
}

const SYSTEM_PROMPT = `You are a Fiverr freelancer assistant that categorizes and summarizes news/updates relevant to Fiverr sellers.

Categories: "Policy Update" | "Algorithm Change" | "New Feature" | "Industry News" | "Community" | "Tips & Strategy"

Urgency:
- "urgent": Immediate action required (policy changes, ToS updates, account risks)
- "normal": Useful to know within a few days
- "low": Background information

For each item return:
{ "index": number, "category": "string", "summary": "2-3 sentence summary for a Fiverr seller", "urgency": "urgent|normal|low" }

Return a JSON array only. No markdown.`

export async function processFeedItems(items: RawFeedItem[]): Promise<ProcessedFeedItem[]> {
  if (items.length === 0) return []

  const results: ProcessedFeedItem[] = [...items] as ProcessedFeedItem[]
  const batchSize = 10

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchText = batch
      .map((item, idx) =>
        `[${i + idx}] Title: ${item.title}\nSource: ${item.source}\nContent: ${(item.rawContent || "").slice(0, 500)}`
      )
      .join("\n\n---\n\n")

    try {
      const response = await ai.chat.completions.create({
        model: MODELS.fast,
        max_tokens: 2048,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Categorize and summarize these ${batch.length} feed items:\n\n${batchText}` },
        ],
      })

      const content = response.choices[0]?.message?.content?.trim() || ""
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) continue

      const parsed = JSON.parse(jsonMatch[0])
      if (!Array.isArray(parsed)) continue

      for (const item of parsed) {
        if (typeof item.index === "number" && item.index < results.length) {
          results[item.index] = {
            ...results[item.index],
            category: item.category || "Industry News",
            summary: item.summary || results[item.index].title,
            urgency: item.urgency || "normal",
          }
        }
      }
    } catch (error) {
      console.error("Feed processing batch error:", error)
      for (let j = i; j < Math.min(i + batchSize, items.length); j++) {
        results[j] = { ...results[j], category: "Industry News", summary: results[j].title, urgency: "normal" }
      }
    }
  }

  return results
}
