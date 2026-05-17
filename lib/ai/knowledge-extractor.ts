import { ai, MODELS } from "./client"

export interface ExtractedKnowledge {
  title: string
  summary: string
  category: string
  keyInsights: string[]
  pricingData?: {
    projectType: string
    priceMin: number
    priceMax: number
    timeline: string
    complexity: string
  }
  tags: string[]
  fullContent: string
}

const SYSTEM_PROMPT = `You are an expert Fiverr freelancer assistant. Extract structured knowledge from this content to build a learning database. Analyze the content thoroughly and extract:
- A concise title
- 2-3 sentence summary of what this document contains
- Category (Quotation/Conversation/Policy/Reference)
- Key insights and learnings (as bullet points)
- Pricing data if present (project type, price range, timeline, complexity)
- Relevant tags
- A clean, well-structured version of the full content

Return ONLY valid JSON matching this interface:
{
  "title": "string",
  "summary": "string (2-3 sentences)",
  "category": "Quotation|Conversation|Policy|Reference",
  "keyInsights": ["string", "..."],
  "pricingData": {
    "projectType": "string",
    "priceMin": number,
    "priceMax": number,
    "timeline": "string",
    "complexity": "string"
  },
  "tags": ["string", "..."],
  "fullContent": "string"
}

Note: pricingData is optional — only include it if pricing information is present in the content.`

export async function extractKnowledgeFromFile(
  content: string,
  fileType: "quotation" | "conversation" | "text" | "policy",
  fileName: string
): Promise<ExtractedKnowledge> {
  const response = await ai.chat.completions.create({
    model: MODELS.smart,
    max_tokens: 3000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `File name: ${fileName}\nFile type hint: ${fileType}\n\nContent to analyze:\n\n${content.slice(0, 8000)}`,
      },
    ],
  })

  const raw = response.choices[0]?.message?.content?.trim() || ""
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("No JSON in knowledge extraction response")

  const parsed = JSON.parse(jsonMatch[0]) as ExtractedKnowledge

  // Ensure pricingData is either complete or absent
  if (parsed.pricingData) {
    const pd = parsed.pricingData
    if (
      !pd.projectType ||
      typeof pd.priceMin !== "number" ||
      typeof pd.priceMax !== "number"
    ) {
      delete parsed.pricingData
    }
  }

  return parsed
}
