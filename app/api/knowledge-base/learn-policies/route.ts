import { NextRequest, NextResponse } from "next/server"
import { kbArticles } from "@/lib/sheets/db"
import { ai, MODELS } from "@/lib/ai/client"

export const maxDuration = 60

interface ExtractedPolicy {
  title: string
  description: string
  category: "Account" | "Orders" | "Communication" | "Payment" | "Content" | "Intellectual Property"
  importance: "critical" | "high" | "medium"
}

async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Syndio/1.0)" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return ""
    const html = await res.text()
    // Strip HTML tags for plain text
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 3000)
  } catch {
    return ""
  }
}

async function searchReddit(query: string): Promise<string> {
  try {
    const encoded = encodeURIComponent(query)
    const url = `https://www.reddit.com/r/fiverr/search.json?q=${encoded}&sort=new&limit=5`
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Syndio/1.0)" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return ""
    const data = await res.json() as {
      data?: { children?: { data?: { title?: string; selftext?: string } }[] }
    }
    const posts = data?.data?.children || []
    return posts
      .map((p) => `${p.data?.title || ""}: ${(p.data?.selftext || "").slice(0, 200)}`)
      .join("\n")
      .slice(0, 2000)
  } catch {
    return ""
  }
}

async function searchTavily(query: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY
  if (!tavilyKey) return ""

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query,
        max_results: 3,
        search_depth: "basic",
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return ""
    const data = await res.json() as { results?: { content?: string }[] }
    return (data.results || [])
      .map((r) => r.content || "")
      .join("\n")
      .slice(0, 2000)
  } catch {
    return ""
  }
}

export async function POST(_request: NextRequest) {
  try {
    // Fetch from multiple sources concurrently
    const [
      tosText,
      policiesText,
      redditText,
      tavilyTos,
      tavilySeller,
    ] = await Promise.all([
      fetchPageText("https://www.fiverr.com/support/articles/360010452219-Fiverr-Terms-of-Service"),
      fetchPageText("https://www.fiverr.com/support/sections/115000577749-Policies"),
      searchReddit("fiverr policy 2026 update"),
      searchTavily("Fiverr TOS policy update 2026"),
      searchTavily("Fiverr seller policy changes"),
    ])

    // Combine up to 8000 chars
    const combined = [
      tosText && `[Fiverr TOS]\n${tosText}`,
      policiesText && `[Fiverr Policies]\n${policiesText}`,
      redditText && `[Reddit r/fiverr]\n${redditText}`,
      tavilyTos && `[Web search - TOS]\n${tavilyTos}`,
      tavilySeller && `[Web search - Seller]\n${tavilySeller}`,
    ]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 8000)

    if (!combined.trim()) {
      return NextResponse.json(
        { error: "Could not fetch any policy content" },
        { status: 502 }
      )
    }

    // Extract policies via AI
    const aiResponse = await ai.chat.completions.create({
      model: MODELS.smart,
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content:
            "You are a Fiverr policy expert. Based on the following content about Fiverr policies, extract and organize the most important policies that affect sellers. Format as structured policy entries with: title, description, category (Account/Orders/Communication/Payment/Content/Intellectual Property), importance (critical/high/medium). Return JSON array.",
        },
        {
          role: "user",
          content: `Policy content:\n\n${combined}\n\nReturn ONLY a valid JSON array of policy objects (max 10).`,
        },
      ],
    })

    const raw = aiResponse.choices[0]?.message?.content?.trim() || ""
    const arrayMatch = raw.match(/\[[\s\S]*\]/)
    if (!arrayMatch) {
      return NextResponse.json({ error: "AI did not return valid policy JSON" }, { status: 500 })
    }

    const policies: ExtractedPolicy[] = JSON.parse(arrayMatch[0])
    const limitedPolicies = policies.slice(0, 10)

    // Get existing articles to check for duplicates
    const existingArticles = await kbArticles.getAll()

    let added = 0
    let updated = 0
    const savedPolicies: ExtractedPolicy[] = []

    for (const policy of limitedPolicies) {
      if (!policy.title || !policy.description) continue

      const titleLower = policy.title.toLowerCase()
      const existing = existingArticles.find(
        (a) =>
          a.category === "Policy" &&
          a.title.toLowerCase().includes(titleLower.slice(0, 20))
      )

      const articleData = {
        title: policy.title,
        content:
          `**Category:** ${policy.category}\n**Importance:** ${policy.importance}\n\n${policy.description}`,
        category: "Policy" as const,
        tags: ["fiverr", "policy", "2026"],
        source: "Auto-fetched: Fiverr Policy Pages",
      }

      if (existing) {
        await kbArticles.update(existing.id, articleData)
        updated++
      } else {
        await kbArticles.insert(articleData)
        added++
      }

      savedPolicies.push(policy)
    }

    return NextResponse.json({
      success: true,
      added,
      updated,
      policies: savedPolicies,
    })
  } catch (error) {
    console.error("Learn policies error:", error)
    return NextResponse.json({ error: "Policy learning failed" }, { status: 500 })
  }
}
