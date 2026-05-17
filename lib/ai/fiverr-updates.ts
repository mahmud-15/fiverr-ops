import { ai, MODELS } from "./client"

export interface GeneratedUpdates {
  news: Array<{ title: string; content: string; source: string; urgency: "urgent" | "normal" | "low"; tags: string[] }>
  sellerTips: Array<{ title: string; content: string; tags: string[] }>
  profileTips: Array<{ title: string; content: string; tags: string[] }>
}

const DEFAULT_UPDATES: GeneratedUpdates = {
  news: [
    {
      title: "Fiverr Continues Expanding Pro Verified Program",
      content: "Fiverr Pro remains one of the fastest-growing segments on the platform. Top sellers are encouraged to apply for Pro status to access higher-paying clients and premium visibility.",
      source: "Fiverr Blog",
      urgency: "normal",
      tags: ["fiverr-pro", "verification"],
    },
    {
      title: "Algorithm Favors Response Rate & Time",
      content: "Recent data indicates Fiverr's search algorithm heavily weights seller response rate and response time. Sellers with sub-1-hour response times see significantly more impressions.",
      source: "Community Reports",
      urgency: "urgent",
      tags: ["algorithm", "response-rate"],
    },
    {
      title: "Fiverr Launches New Seller Analytics Dashboard",
      content: "Fiverr rolled out an enhanced analytics dashboard giving sellers deeper insights into traffic sources, conversion rates, and buyer demographics.",
      source: "Fiverr Updates",
      urgency: "normal",
      tags: ["analytics", "dashboard"],
    },
    {
      title: "Buyer Satisfaction Score Now Affects Ranking",
      content: "Fiverr has confirmed that private buyer satisfaction scores (not just public reviews) now factor into gig ranking. Focus on exceeding buyer expectations on every order.",
      source: "Fiverr Help Center",
      urgency: "urgent",
      tags: ["ranking", "reviews", "satisfaction"],
    },
    {
      title: "New Gig Package Pricing Guidelines Released",
      content: "Fiverr updated its recommendations for gig package pricing tiers, encouraging sellers to offer clearly differentiated Basic, Standard, and Premium packages.",
      source: "Fiverr Blog",
      urgency: "low",
      tags: ["pricing", "packages"],
    },
  ],
  sellerTips: [
    {
      title: "Optimize Your Response Time",
      content: "Set up Fiverr mobile notifications and aim to respond to all inquiries within 1 hour. Sellers with under 1-hour response time appear significantly higher in search results. Even a brief 'I'll get back to you shortly' counts as a response.",
      tags: ["response-time", "ranking"],
    },
    {
      title: "Use Video Gig Previews",
      content: "Gigs with video previews convert up to 220% better than those without. Create a 30-75 second video explaining your service, showing sample work, and speaking directly to your ideal buyer.",
      tags: ["gig-optimization", "conversion"],
    },
    {
      title: "Leverage Buyer Requests Daily",
      content: "Check Buyer Requests every morning and send 5-10 tailored proposals. Personalize each offer by referencing specific details from the buyer's request. Generic proposals are ignored.",
      tags: ["buyer-requests", "leads"],
    },
    {
      title: "Gather & Showcase Niche Keywords",
      content: "Research what keywords buyers use to find services like yours. Use tools like Fiverr's own search suggest, UberSuggest, or Google Keyword Planner. Incorporate 3-5 high-intent keywords naturally in your gig title and description.",
      tags: ["SEO", "keywords"],
    },
    {
      title: "Upsell with Gig Extras",
      content: "Strategically price gig extras to significantly increase average order value. Offer extras for source files, faster delivery, additional revisions, or extended licenses. These can double your earnings per order.",
      tags: ["upsell", "pricing", "revenue"],
    },
    {
      title: "Maintain Order Completion Rate Above 90%",
      content: "Cancellations hurt your ranking more than negative reviews. Always communicate proactively if an order is at risk. Use mutual cancellation only as a last resort and never cancel unilaterally.",
      tags: ["completion-rate", "ranking"],
    },
  ],
  profileTips: [
    {
      title: "Professional Profile Photo",
      content: "Use a high-resolution, professional headshot with good lighting and a clean background. Profiles with clear, friendly photos receive 40% more clicks. Smile and make eye contact with the camera.",
      tags: ["profile-photo", "first-impression"],
    },
    {
      title: "Craft a Compelling Profile Description",
      content: "Your profile description should clearly state your specialty, years of experience, and unique value proposition in the first two sentences. Use bullet points to list your top skills and keep it under 250 words. End with a clear call-to-action.",
      tags: ["profile-description", "copywriting"],
    },
    {
      title: "Display Relevant Skills & Certifications",
      content: "Complete all skills assessments offered by Fiverr to earn verified skill badges. These badges appear prominently on your profile and gigs, significantly increasing buyer trust and conversion rates.",
      tags: ["skills", "certifications", "trust"],
    },
    {
      title: "Link Professional Social Profiles",
      content: "Connect your LinkedIn, GitHub, or portfolio website to your Fiverr profile. This adds credibility and allows buyers to verify your expertise before ordering. Ensure your linked profiles are up-to-date and professional.",
      tags: ["social-proof", "credibility"],
    },
    {
      title: "Create a Portfolio Showcase",
      content: "Upload 5-10 of your best work samples to your Fiverr portfolio. Use high-quality images, include project descriptions, and show diverse work types. A strong portfolio can increase order rates by up to 65%.",
      tags: ["portfolio", "samples", "conversion"],
    },
  ],
}

export async function generateFiverrUpdates(rawNewsContext: string): Promise<GeneratedUpdates> {
  try {
    const userMessage = rawNewsContext
      ? `Here is the latest Fiverr-related context from the web:\n\n${rawNewsContext}\n\nBased on this context, generate curated updates for Fiverr sellers.`
      : "Generate comprehensive updates for Fiverr sellers based on the latest known Fiverr trends, policies, and best practices for 2026."

    const completion = await ai.chat.completions.create({
      model: MODELS.smart,
      messages: [
        {
          role: "system",
          content: `You are a Fiverr expert assistant. Based on the provided latest Fiverr news and context, generate:
- A curated list of 5 important news items relevant to Fiverr sellers
- 6 actionable seller tips for today
- 5 profile optimization tips based on current Fiverr trends and algorithm updates

Return ONLY valid JSON with no extra text, markdown, or code blocks:
{
  "news": [
    { "title": "string", "content": "2-3 sentence summary", "source": "source name", "urgency": "urgent|normal|low", "tags": ["tag1"] }
  ],
  "sellerTips": [
    { "title": "short title", "content": "detailed actionable tip", "tags": ["tag1"] }
  ],
  "profileTips": [
    { "title": "short title", "content": "specific optimization tip", "tags": ["tag1"] }
  ]
}`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const raw = completion.choices[0]?.message?.content || ""

    // Strip any markdown code fences if present
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    const parsed = JSON.parse(cleaned) as GeneratedUpdates

    // Validate structure
    if (!parsed.news || !parsed.sellerTips || !parsed.profileTips) {
      throw new Error("Invalid response structure")
    }

    return parsed
  } catch (error) {
    console.error("generateFiverrUpdates error:", error)
    return DEFAULT_UPDATES
  }
}
