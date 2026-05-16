import { ai, MODELS } from "./client"

export interface AIIssue {
  severity: "critical" | "high" | "medium" | "low"
  type: string
  description: string
  quotedText: string
  suggestion: string
  policyRef: string
}

const SYSTEM_PROMPT = `You are a Fiverr policy compliance expert. Analyze this conversation for policy violations beyond basic pattern matching.

Look for:
1. Implied off-platform contact attempts (e.g., "I usually prefer chatting elsewhere", "let me know your other contacts")
2. Indirect contact info sharing (e.g., "my username is the same everywhere")
3. Fee circumvention implications (e.g., "we could save on fees", "let's do this directly next time")
4. Forbidden promises (guaranteed rankings, fake reviews, guaranteed results)
5. Problematic tone patterns (threatening, manipulative, abusive language)
6. IP concerns (claiming ownership of others' work, plagiarism offers)
7. Prohibited services (academic fraud, fake identity documents, etc.)
8. Inappropriate relationship boundary violations

Return a JSON array of issues. Each issue must have:
{
  "severity": "critical" | "high" | "medium" | "low",
  "type": "short category name",
  "description": "clear explanation of why this violates policy",
  "quotedText": "the exact problematic text (max 100 chars)",
  "suggestion": "what to do instead",
  "policyRef": "Fiverr TOS section reference"
}

If no additional issues found beyond what rules already caught, return [].
Return ONLY valid JSON array, no markdown, no explanation outside the array.`

export async function analyzeConversationWithAI(
  text: string,
  ruleResults: { type: string; match: string }[]
): Promise<AIIssue[]> {
  const rulesSummary = ruleResults.length > 0
    ? `\n\nRule-based scan already found ${ruleResults.length} issues. Focus on contextual/implied violations not caught by regex patterns.`
    : ""

  try {
    const response = await ai.chat.completions.create({
      model: MODELS.smart,
      max_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this Fiverr conversation for policy violations:${rulesSummary}\n\n---\n${text.slice(0, 8000)}\n---`,
        },
      ],
    })

    const content = response.choices[0]?.message?.content?.trim() || ""
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []
    const parsed = JSON.parse(jsonMatch[0])
    return Array.isArray(parsed) ? (parsed as AIIssue[]) : []
  } catch (error) {
    console.error("AI compliance analysis error:", error)
    return []
  }
}
