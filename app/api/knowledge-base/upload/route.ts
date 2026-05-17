import { NextRequest, NextResponse } from "next/server"
import { kbArticles } from "@/lib/sheets/db"
import { ai, MODELS } from "@/lib/ai/client"
import { extractKnowledgeFromFile } from "@/lib/ai/knowledge-extractor"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get("file") as File | null
    const fileType = (formData.get("fileType") as string) || "text"
    const pastedText = (formData.get("text") as string) || ""

    const validFileTypes = ["quotation", "conversation", "text", "policy"] as const
    type ValidFileType = typeof validFileTypes[number]
    const resolvedFileType: ValidFileType = validFileTypes.includes(fileType as ValidFileType)
      ? (fileType as ValidFileType)
      : "text"

    let extractedText = ""
    let fileName = "pasted-text.txt"

    if (file && file.size > 0) {
      fileName = file.name
      const mimeType = file.type

      if (mimeType === "application/pdf") {
        // PDF: use pdf-parse
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse")
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text || ""
      } else if (mimeType.startsWith("image/")) {
        // Image: use Groq vision OCR
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString("base64")

        const visionResponse = await ai.chat.completions.create({
          model: MODELS.vision,
          max_tokens: 3000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${base64}` },
                },
                {
                  type: "text",
                  text: "Extract ALL text from this image verbatim. Preserve formatting, numbers, prices, dates.",
                },
              ],
            },
          ],
        })
        extractedText = visionResponse.choices[0]?.message?.content?.trim() || ""
      } else {
        // Treat as plain text
        extractedText = await file.text()
      }
    } else if (pastedText.trim()) {
      extractedText = pastedText.trim()
    } else {
      return NextResponse.json(
        { error: "Provide a file or text content" },
        { status: 400 }
      )
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the provided input" },
        { status: 422 }
      )
    }

    // Run AI knowledge extraction
    const knowledge = await extractKnowledgeFromFile(extractedText, resolvedFileType, fileName)

    // Build main article content
    const keyInsightLines = knowledge.keyInsights.map((k) => `• ${k}`).join("\n")
    const articleContent =
      `${knowledge.summary}\n\n**Key Insights:**\n${keyInsightLines}\n\n**Full Content:**\n${knowledge.fullContent}`

    // Save primary article
    const article = await kbArticles.insert({
      title: knowledge.title,
      content: articleContent,
      category: knowledge.category,
      tags: knowledge.tags,
      source: `Uploaded: ${fileName}`,
    })

    // Save pricing article if pricing data was found
    let pricingArticle = null
    if (knowledge.pricingData) {
      const pd = knowledge.pricingData
      const pricingContent =
        `**Project Type:** ${pd.projectType}\n` +
        `**Price Range:** $${pd.priceMin} – $${pd.priceMax}\n` +
        `**Timeline:** ${pd.timeline}\n` +
        `**Complexity:** ${pd.complexity}\n\n` +
        `*Extracted from: ${knowledge.title}*`

      pricingArticle = await kbArticles.insert({
        title: `Pricing: ${pd.projectType}`,
        content: pricingContent,
        category: "Pricing",
        tags: [...knowledge.tags, "pricing"],
        source: `Uploaded: ${fileName}`,
      })
    }

    return NextResponse.json({
      success: true,
      article,
      pricingArticle,
      insights: knowledge.keyInsights,
      pricingData: knowledge.pricingData ?? null,
    })
  } catch (error) {
    console.error("KB upload error:", error)
    return NextResponse.json({ error: "Upload and extraction failed" }, { status: 500 })
  }
}
