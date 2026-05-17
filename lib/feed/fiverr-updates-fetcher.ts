interface RedditPost {
  data: {
    title: string
    selftext: string
    score: number
  }
}

interface RedditResponse {
  data: {
    children: RedditPost[]
  }
}

interface TavilySearchResult {
  title: string
  content: string
  published_date?: string
}

interface TavilyResponse {
  results: TavilySearchResult[]
}

async function fetchRedditContext(): Promise<string> {
  try {
    const response = await fetch(
      "https://www.reddit.com/r/fiverr/hot.json?limit=10",
      {
        headers: {
          "User-Agent": "Syndio/1.0 (personal tool)",
        },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!response.ok) return ""

    const data = (await response.json()) as RedditResponse
    const posts = (data.data?.children || [])
      .filter((post) => post.data.score > 3)
      .slice(0, 10)

    return posts
      .map((post) => {
        const body = post.data.selftext?.slice(0, 200) || ""
        return `[Reddit] ${post.data.title}${body ? `: ${body}` : ""}`
      })
      .join("\n")
  } catch (error) {
    console.error("Reddit fetch error:", error)
    return ""
  }
}

async function searchTavilyContext(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) return ""

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        include_answer: false,
        include_images: false,
        max_results: 5,
        days: 30,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) return ""

    const data = (await response.json()) as TavilyResponse
    return (data.results || [])
      .map((item) => `[${query}] ${item.title}: ${item.content.slice(0, 300)}`)
      .join("\n")
  } catch (error) {
    console.error("Tavily search error:", error)
    return ""
  }
}

export async function fetchFiverrLatestContext(): Promise<string> {
  const parts: string[] = []

  const fetchTasks: Promise<string>[] = [fetchRedditContext()]

  if (process.env.TAVILY_API_KEY) {
    fetchTasks.push(
      searchTavilyContext("Fiverr seller tips 2026"),
      searchTavilyContext("Fiverr algorithm update"),
      searchTavilyContext("Fiverr policy 2026")
    )
  }

  const results = await Promise.allSettled(fetchTasks)

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      parts.push(result.value)
    }
  }

  const combined = parts.join("\n\n")
  return combined.slice(0, 6000)
}
