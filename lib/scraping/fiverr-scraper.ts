export interface GigData {
  title: string
  url: string
  description: string
  price: string
  rating?: number
  reviewCount?: number
  tags?: string[]
}

export interface ProfileData {
  displayName: string
  username: string
  description: string
  profileUrl: string
  level?: string
  rating?: number
  reviewCount?: number
  responseRate?: string
  responseTime?: string
  completionRate?: string
  skills?: string[]
  languages?: string[]
  gigs?: GigData[]
  memberSince?: string
  lastDelivery?: string
  totalOrders?: number
  isMock?: boolean
}

function extractText(html: string, pattern: RegExp): string {
  const match = html.match(pattern)
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : ""
}

function extractRating(html: string): number | undefined {
  const match = html.match(/(\d+\.\d+)\s*(?:stars?|rating)/i)
  if (match) return parseFloat(match[1])
  const match2 = html.match(/class="[^"]*rating[^"]*"[^>]*>[\s\S]*?(\d+\.\d+)/i)
  if (match2) return parseFloat(match2[1])
  return undefined
}

function extractNumber(html: string, pattern: RegExp): number | undefined {
  const match = html.match(pattern)
  if (match) {
    const numStr = match[1].replace(/,/g, "")
    const num = parseInt(numStr, 10)
    return isNaN(num) ? undefined : num
  }
  return undefined
}

function extractGigs(html: string, baseUrl: string): GigData[] {
  const gigs: GigData[] = []

  // Try to find gig links with titles
  const gigPattern = /href="(\/[^"]*\/gig\/[^"]+)"[^>]*>[\s\S]{0,200}?<[^>]*(?:title|h3|h2)[^>]*>([\s\S]*?)<\/[^>]+>/gi
  const basicGigPattern = /href="([^"]*fiverr\.com[^"]*\/gig[^"]+)"[^>]*title="([^"]+)"/gi

  let match
  const seen = new Set<string>()

  while ((match = gigPattern.exec(html)) !== null) {
    const url = match[1].startsWith("http") ? match[1] : `https://www.fiverr.com${match[1]}`
    const title = match[2].replace(/<[^>]+>/g, "").trim()
    if (title && !seen.has(url) && gigs.length < 10) {
      seen.add(url)
      gigs.push({
        title,
        url,
        description: "",
        price: "See gig",
      })
    }
  }

  while ((match = basicGigPattern.exec(html)) !== null) {
    if (!seen.has(match[1]) && gigs.length < 10) {
      seen.add(match[1])
      gigs.push({
        title: match[2],
        url: match[1],
        description: "",
        price: "See gig",
      })
    }
  }

  return gigs
}

function getMockProfileData(profileUrl: string): ProfileData {
  const username = profileUrl.split("/").filter(Boolean).pop() || "freelancer"
  return {
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    username,
    description: "Mock profile data - ScrapingBee API key not configured. Set SCRAPINGBEE_API_KEY in your .env to enable live scraping.",
    profileUrl,
    level: "Level 2 Seller",
    rating: 4.9,
    reviewCount: 127,
    responseRate: "98%",
    responseTime: "1 hour",
    completionRate: "99%",
    skills: ["Web Development", "React", "Node.js", "TypeScript"],
    languages: ["English", "Bengali"],
    gigs: [
      {
        title: "I will build a modern React web application",
        url: `https://www.fiverr.com/${username}/build-react-app`,
        description: "Professional React development with TypeScript",
        price: "$150",
        rating: 4.9,
        reviewCount: 45,
        tags: ["React", "TypeScript", "Web Dev"],
      },
      {
        title: "I will create a responsive website with Next.js",
        url: `https://www.fiverr.com/${username}/nextjs-website`,
        description: "Full-stack Next.js development",
        price: "$200",
        rating: 5.0,
        reviewCount: 32,
        tags: ["Next.js", "Full Stack"],
      },
    ],
    memberSince: "2021",
    totalOrders: 189,
    isMock: true,
  }
}

export async function scrapeFiverrProfile(profileUrl: string): Promise<ProfileData> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY

  if (!apiKey) {
    console.warn("SCRAPINGBEE_API_KEY not set, returning mock data")
    return getMockProfileData(profileUrl)
  }

  try {
    const encodedUrl = encodeURIComponent(profileUrl)
    const scrapingUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodedUrl}&render_js=true&wait=3000&block_ads=true`

    const response = await fetch(scrapingUrl, {
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      console.error("ScrapingBee error:", response.status, response.statusText)
      return getMockProfileData(profileUrl)
    }

    const html = await response.text()

    // Extract username from URL
    const urlParts = profileUrl.replace(/^https?:\/\//, "").split("/")
    const username = urlParts.find((part, i) => urlParts[i - 1] === "fiverr.com" || urlParts[i - 1] === "www.fiverr.com") || urlParts[urlParts.length - 1] || ""

    // Extract profile data from HTML
    const displayName = extractText(html, /class="[^"]*username[^"]*"[^>]*>([\s\S]*?)<\//i) ||
      extractText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
      username

    const description = extractText(html, /class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\//i) ||
      extractText(html, /class="[^"]*seller-overview[^"]*"[^>]*>([\s\S]*?)<\//i) ||
      ""

    const rating = extractRating(html)
    const reviewCount = extractNumber(html, /(\d[\d,]+)\s*reviews?/i)
    const totalOrders = extractNumber(html, /(\d[\d,]+)\s*orders?\s*completed/i)

    const gigs = extractGigs(html, "https://www.fiverr.com")

    // Extract skills
    const skillsMatch = html.match(/class="[^"]*skill[^"]*"[^>]*>([\s\S]*?)<\/ul>/i)
    const skills: string[] = []
    if (skillsMatch) {
      const skillMatches = skillsMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)
      for (const match of skillMatches) {
        const skill = match[1].replace(/<[^>]+>/g, "").trim()
        if (skill) skills.push(skill)
      }
    }

    return {
      displayName: displayName || username,
      username,
      description,
      profileUrl,
      rating,
      reviewCount,
      totalOrders,
      skills: skills.length > 0 ? skills : undefined,
      gigs: gigs.length > 0 ? gigs : undefined,
      isMock: false,
    }
  } catch (error) {
    console.error("Scraping error:", error)
    return getMockProfileData(profileUrl)
  }
}
