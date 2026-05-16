import type { RawFeedItem } from "../ai/feed-processor"

interface TavilySearchResult {
  title: string
  url: string
  content: string
  published_date?: string
}

interface TavilyResponse {
  results: TavilySearchResult[]
}

interface RedditPost {
  data: {
    title: string
    url: string
    selftext: string
    permalink: string
    created_utc: number
    score: number
  }
}

interface RedditResponse {
  data: {
    children: RedditPost[]
  }
}

async function searchTavily(query: string): Promise<RawFeedItem[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    console.warn("TAVILY_API_KEY not set")
    return []
  }

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

    if (!response.ok) {
      console.error("Tavily error:", response.status)
      return []
    }

    const data = (await response.json()) as TavilyResponse
    return (data.results || []).map((item) => ({
      title: item.title,
      url: item.url,
      source: "Tavily / Web",
      publishedAt: item.published_date,
      rawContent: item.content,
    }))
  } catch (error) {
    console.error("Tavily search error:", error)
    return []
  }
}

async function fetchRedditFiverr(): Promise<RawFeedItem[]> {
  try {
    const response = await fetch(
      "https://www.reddit.com/r/fiverr/hot.json?limit=25",
      {
        headers: {
          "User-Agent": "FiverrOps/1.0 (personal tool)",
        },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!response.ok) return []

    const data = (await response.json()) as RedditResponse
    return (data.data?.children || [])
      .filter((post) => post.data.score > 5)
      .map((post) => ({
        title: post.data.title,
        url: `https://www.reddit.com${post.data.permalink}`,
        source: "Reddit r/fiverr",
        publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
        rawContent: post.data.selftext?.slice(0, 500) || "",
      }))
  } catch (error) {
    console.error("Reddit fetch error:", error)
    return []
  }
}

async function fetchFiverrBlogRSS(): Promise<RawFeedItem[]> {
  try {
    const response = await fetch("https://www.fiverr.com/resources/guides/feed/", {
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) return []

    const text = await response.text()

    // Parse RSS/Atom feed items
    const items: RawFeedItem[] = []
    const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/gi)

    for (const match of itemMatches) {
      const itemText = match[1]
      const titleMatch = itemText.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/i)
      const linkMatch = itemText.match(/<link>([\s\S]*?)<\/link>/i)
      const dateMatch = itemText.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)
      const descMatch = itemText.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i)

      if (titleMatch && linkMatch) {
        items.push({
          title: (titleMatch[1] || titleMatch[2] || "").trim(),
          url: linkMatch[1].trim(),
          source: "Fiverr Blog",
          publishedAt: dateMatch ? new Date(dateMatch[1]).toISOString() : undefined,
          rawContent: (descMatch?.[1] || descMatch?.[2] || "").replace(/<[^>]+>/g, "").trim().slice(0, 500),
        })
      }
    }

    return items.slice(0, 10)
  } catch (error) {
    console.error("Fiverr blog RSS error:", error)
    return []
  }
}

function deduplicateByUrl(items: RawFeedItem[]): RawFeedItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const normalized = item.url.replace(/\/$/, "").toLowerCase()
    if (seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
}

export async function fetchFeedItems(): Promise<RawFeedItem[]> {
  const searchQueries = [
    "Fiverr policy update 2025",
    "Fiverr algorithm change freelancer",
    "Fiverr platform news sellers",
    "Fiverr seller update tips",
  ]

  // Run all fetches in parallel
  const [
    tavilyResults1,
    tavilyResults2,
    tavilyResults3,
    tavilyResults4,
    redditResults,
    blogResults,
  ] = await Promise.allSettled([
    searchTavily(searchQueries[0]),
    searchTavily(searchQueries[1]),
    searchTavily(searchQueries[2]),
    searchTavily(searchQueries[3]),
    fetchRedditFiverr(),
    fetchFiverrBlogRSS(),
  ])

  const allItems: RawFeedItem[] = []

  for (const result of [
    tavilyResults1,
    tavilyResults2,
    tavilyResults3,
    tavilyResults4,
    redditResults,
    blogResults,
  ]) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value)
    }
  }

  return deduplicateByUrl(allItems)
}
