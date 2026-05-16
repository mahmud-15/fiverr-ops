import { getSheetsClient, SPREADSHEET_ID } from "./client"
import { SHEETS, COLUMNS, insert } from "./db"
import type { Template } from "./db"

const DEFAULT_TEMPLATES: Partial<Template>[] = [
  {
    title: "First Reply – New Inquiry",
    scenario: "first_reply",
    content: `Hi {{buyer_name}},

Thanks for reaching out! I'd love to help with your project.

I specialize in [your niche] and have successfully delivered [relevant experience].

Could you share a bit more about your requirements and timeline? That'll help me put together the best approach for you.

Looking forward to working with you!

Best,
Mahmud`,
    tags: ["first-reply", "inquiry"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Scope Clarification Request",
    scenario: "scope_clarification",
    content: `Hi {{buyer_name}},

Thank you for the order! Before I start, I just want to confirm a few details to make sure I deliver exactly what you need:

1. [Specific question 1]
2. [Specific question 2]
3. [Specific question 3]

Once I have this info, I'll get started right away. Please respond within [X] days so we stay on schedule.

Best,
Mahmud`,
    tags: ["scope", "clarification"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Price Negotiation – Hold Firm",
    scenario: "price_negotiation",
    content: `Hi {{buyer_name}},

I appreciate your interest! My pricing reflects the quality and time investment for this type of work.

The rate I've quoted covers:
- [Deliverable 1]
- [Deliverable 2]
- [Revisions included]

I'm confident you'll find it's great value. If budget is a concern, I can discuss a scaled-down version that fits your needs.

Let me know how you'd like to proceed!

Best,
Mahmud`,
    tags: ["pricing", "negotiation"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Revision Request Response",
    scenario: "revision",
    content: `Hi {{buyer_name}},

Thanks for your feedback! I want to make sure this is perfect for you.

I've noted the following changes:
- [Change 1]
- [Change 2]

I'll have the revised version ready by [date/time]. Please note that this falls within the [X] revisions included in your order.

Best,
Mahmud`,
    tags: ["revision", "feedback"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Dispute Resolution – Professional Response",
    scenario: "dispute",
    content: `Hi {{buyer_name}},

I'm sorry to hear you're not satisfied. Your happiness with the work is very important to me.

I've reviewed your concerns and would like to address them:

[Address specific concerns here]

I'm committed to resolving this to your satisfaction. Could we discuss what specific changes would make this work for you?

Best,
Mahmud`,
    tags: ["dispute", "resolution"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Order Completion – Request Review",
    scenario: "order_completion",
    content: `Hi {{buyer_name}},

I'm thrilled to have completed your project! It's been a pleasure working with you.

I've delivered:
✓ [Deliverable 1]
✓ [Deliverable 2]

If you have any questions about the delivered files, please don't hesitate to ask.

If you're happy with the work, a 5-star review would mean the world to me and helps other buyers make informed decisions.

Thank you for choosing my services!

Best,
Mahmud`,
    tags: ["completion", "review-request"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Delivery Delay Notice",
    scenario: "delivery",
    content: `Hi {{buyer_name}},

I wanted to give you a heads-up that I need a little more time to deliver top-quality work on your project.

I'll have everything ready by [new date/time] — just [X hours/days] from now.

I apologize for any inconvenience and appreciate your understanding. Quality is my top priority!

Best,
Mahmud`,
    tags: ["delay", "communication"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Upsell – Additional Services",
    scenario: "upsell",
    content: `Hi {{buyer_name}},

Great news — your project is coming along beautifully!

I wanted to mention that I also offer [complementary service] which would really take this to the next level. Many clients find it pairs perfectly with what we're already doing.

Would you like me to add that on? I can offer it at a special rate since we're already working together.

Best,
Mahmud`,
    tags: ["upsell", "services"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Requirements Not Met – Pause Order",
    scenario: "requirements",
    content: `Hi {{buyer_name}},

I noticed that the order requirements are incomplete. To deliver the best work possible, I need:

- [Required item 1]
- [Required item 2]

Could you please provide these details? I'll start working immediately once I have everything.

Best,
Mahmud`,
    tags: ["requirements", "pause"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Mutual Cancellation Request",
    scenario: "cancellation",
    content: `Hi {{buyer_name}},

After careful consideration, I think a mutual cancellation may be the best path forward here, given [brief reason without details].

This would release both of us from the order with no negative impact on either account.

If you'd prefer to continue, I'm happy to discuss how we can make this work. Please let me know your thoughts.

Best,
Mahmud`,
    tags: ["cancellation", "mutual"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Custom Offer Follow-Up",
    scenario: "custom_offer",
    content: `Hi {{buyer_name}},

I wanted to follow up on the custom offer I sent over. It includes everything we discussed:

- [Deliverable 1]
- [Deliverable 2]
- Timeline: [X days]

The offer expires in [X days]. Let me know if you have any questions!

Best,
Mahmud`,
    tags: ["custom-offer", "follow-up"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Repeat Buyer Welcome Back",
    scenario: "repeat_buyer",
    content: `Hi {{buyer_name}},

Welcome back! It's always great working with you again.

I'm excited to dive into this new project. Based on our previous work together, I already have a good understanding of your style and preferences.

Let's make this one even better!

Best,
Mahmud`,
    tags: ["repeat-buyer", "relationship"],
    use_count: 0,
    compliance_checked: true,
  },
  {
    title: "Rush Order – Feasibility Check",
    scenario: "rush",
    content: `Hi {{buyer_name}},

Thank you for reaching out! I can see you need this done quickly.

For a rush delivery by [deadline], I can make it work with a rush fee of [amount] to prioritize your project.

Here's what I'll deliver:
- [Deliverable 1]
- [Deliverable 2]

Ready to start immediately upon your confirmation. Shall we proceed?

Best,
Mahmud`,
    tags: ["rush", "urgent"],
    use_count: 0,
    compliance_checked: true,
  },
]

export async function initializeSpreadsheet(): Promise<{ success: boolean; message: string; details: string[] }> {
  const details: string[] = []

  try {
    const sheets = getSheetsClient()

    // 1. Get spreadsheet metadata
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
    const existingSheets = (meta.data.sheets || []).map((s) => s.properties?.title || "")
    details.push(`Found ${existingSheets.length} existing sheets: ${existingSheets.join(", ")}`)

    // 2. Create missing sheet tabs
    const sheetNames = Object.values(SHEETS)
    const missingSheets = sheetNames.filter((name) => !existingSheets.includes(name))

    if (missingSheets.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: missingSheets.map((title) => ({
            addSheet: { properties: { title } },
          })),
        },
      })
      details.push(`Created sheets: ${missingSheets.join(", ")}`)
    } else {
      details.push("All sheets already exist")
    }

    // 3. Write headers to each sheet if row 1 is empty
    for (const sheetName of sheetNames) {
      const headerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1:ZZ1`,
      })
      const headerRow = headerResponse.data.values?.[0] || []
      if (headerRow.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A1`,
          valueInputOption: "RAW",
          requestBody: { values: [COLUMNS[sheetName]] },
        })
        details.push(`Wrote headers to ${sheetName}`)
      } else {
        details.push(`Headers already exist in ${sheetName}`)
      }
    }

    // 4. Seed templates if empty
    const templateResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.TEMPLATES}!A2:A`,
    })
    const templateRows = (templateResponse.data.values || []).filter((r) => r[0])

    if (templateRows.length === 0) {
      for (const template of DEFAULT_TEMPLATES) {
        await insert(SHEETS.TEMPLATES, template as Record<string, unknown>)
      }
      details.push(`Seeded ${DEFAULT_TEMPLATES.length} default templates`)
    } else {
      details.push(`Templates sheet already has ${templateRows.length} rows — skipping seed`)
    }

    return { success: true, message: "Spreadsheet initialized successfully", details }
  } catch (error) {
    console.error("initializeSpreadsheet error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, message: `Initialization failed: ${message}`, details }
  }
}
