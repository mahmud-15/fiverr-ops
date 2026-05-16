import { ai, MODELS } from "./client"

export interface ProfileAuditResult {
  overallScore: number
  categories: {
    accountHealth: CategoryScore
    gigOptimization: CategoryScore
    profileStrength: CategoryScore
    reviewAnalysis: CategoryScore
    riskIndicators: CategoryScore
  }
  actionItems: ActionItem[]
  insights: string[]
  gigBreakdown: GigAudit[]
}

export interface CategoryScore {
  score: number
  label: string
  details: string[]
  color: "green" | "yellow" | "red"
}

export interface ActionItem {
  priority: "urgent" | "high" | "medium" | "low"
  title: string
  description: string
  impact: string
}

export interface GigAudit {
  title: string
  url?: string
  score: number
  issues: string[]
  opportunities: string[]
}

const SYSTEM_PROMPT = `You are a Fiverr profile optimization expert with deep knowledge of the platform's algorithm, best practices, and success factors.

Analyze the provided Fiverr profile data and return a comprehensive audit as valid JSON.

Scoring guidelines:
- Account Health (0-100): Level, response rate, completion rate, warnings/restrictions
- Gig Optimization (0-100): SEO, title quality, description completeness, pricing structure, package clarity
- Profile Strength (0-100): Bio completeness, skills, portfolio, video, certifications
- Review Analysis (0-100): Rating score, review count, review quality, response to reviews
- Risk Indicators (0-100): Higher = safer, look for policy violations, account risks, red flags

Return this exact JSON structure:
{
  "overallScore": number,
  "categories": {
    "accountHealth": { "score": number, "label": "brief label", "details": ["detail1"], "color": "green"|"yellow"|"red" },
    "gigOptimization": { "score": number, "label": "brief label", "details": ["detail1"], "color": "green"|"yellow"|"red" },
    "profileStrength": { "score": number, "label": "brief label", "details": ["detail1"], "color": "green"|"yellow"|"red" },
    "reviewAnalysis": { "score": number, "label": "brief label", "details": ["detail1"], "color": "green"|"yellow"|"red" },
    "riskIndicators": { "score": number, "label": "brief label", "details": ["detail1"], "color": "green"|"yellow"|"red" }
  },
  "actionItems": [{ "priority": "urgent"|"high"|"medium"|"low", "title": "string", "description": "string", "impact": "string" }],
  "insights": ["string"],
  "gigBreakdown": [{ "title": "string", "url": "string", "score": number, "issues": ["string"], "opportunities": ["string"] }]
}

Color thresholds: 0-49 = red, 50-74 = yellow, 75-100 = green
Return ONLY valid JSON, no markdown.`

export async function auditProfileWithAI(
  profileData: Record<string, unknown>
): Promise<ProfileAuditResult> {
  try {
    const response = await ai.chat.completions.create({
      model: MODELS.smart,
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Audit this Fiverr profile:\n\n${JSON.stringify(profileData, null, 2).slice(0, 8000)}`,
        },
      ],
    })

    const content = response.choices[0]?.message?.content?.trim() || ""
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON in response")
    return JSON.parse(jsonMatch[0]) as ProfileAuditResult
  } catch (error) {
    console.error("Profile audit AI error:", error)
    return {
      overallScore: 0,
      categories: {
        accountHealth: { score: 0, label: "Analysis failed", details: ["Unable to analyze"], color: "red" },
        gigOptimization: { score: 0, label: "Analysis failed", details: ["Unable to analyze"], color: "red" },
        profileStrength: { score: 0, label: "Analysis failed", details: ["Unable to analyze"], color: "red" },
        reviewAnalysis: { score: 0, label: "Analysis failed", details: ["Unable to analyze"], color: "red" },
        riskIndicators: { score: 0, label: "Analysis failed", details: ["Unable to analyze"], color: "red" },
      },
      actionItems: [],
      insights: ["Profile analysis failed. Please try again."],
      gigBreakdown: [],
    }
  }
}
