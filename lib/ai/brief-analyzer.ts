import { ai, MODELS } from "./client"

export interface BriefAnalysis {
  requirements: Requirement[]
  missingInfo: MissingInfo[]
  scopeRisks: ScopeRisk[]
  suggestedPriceRange: PriceRange
  clarifyingQuestions: ClarifyingQuestion[]
  deliverables: Deliverable[]
  complexity: "simple" | "moderate" | "complex"
  estimatedTimeline: string
}

export interface Requirement { item: string; category: string; isExplicit: boolean }
export interface MissingInfo { topic: string; importance: "critical" | "important" | "nice-to-have"; question: string }
export interface ScopeRisk { risk: string; severity: "high" | "medium" | "low"; mitigation: string }
export interface PriceRange { min: number; max: number; recommended: number; currency: string; rationale: string }
export interface ClarifyingQuestion { question: string; purpose: string; priority: number }
export interface Deliverable { item: string; format?: string; isExplicit: boolean }

const SYSTEM_PROMPT = `You are an expert Fiverr freelancer analyst specializing in project scoping and client communication. Analyze client project briefs to help freelancers understand requirements, identify risks, and price accurately.

Return a comprehensive analysis as valid JSON:
{
  "requirements": [{ "item": "string", "category": "Design|Development|Content|Research|Other", "isExplicit": boolean }],
  "missingInfo": [{ "topic": "string", "importance": "critical|important|nice-to-have", "question": "string" }],
  "scopeRisks": [{ "risk": "string", "severity": "high|medium|low", "mitigation": "string" }],
  "suggestedPriceRange": { "min": number, "max": number, "recommended": number, "currency": "USD", "rationale": "string" },
  "clarifyingQuestions": [{ "question": "string", "purpose": "string", "priority": number }],
  "deliverables": [{ "item": "string", "format": "string", "isExplicit": boolean }],
  "complexity": "simple|moderate|complex",
  "estimatedTimeline": "e.g., 3-5 days"
}

Be practical and specific. Price ranges should reflect real Fiverr market rates.
Return ONLY valid JSON, no markdown.`

export async function analyzeBrief(briefText: string): Promise<BriefAnalysis> {
  const response = await ai.chat.completions.create({
    model: MODELS.smart,
    max_tokens: 3000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Analyze this client brief:\n\n${briefText.slice(0, 5000)}` },
    ],
  })

  const content = response.choices[0]?.message?.content?.trim() || ""
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("No JSON in response")
  return JSON.parse(jsonMatch[0]) as BriefAnalysis
}
