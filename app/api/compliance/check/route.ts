import { NextRequest, NextResponse } from "next/server"
import { complianceChecks, complianceRules } from "@/lib/sheets/db"
import { runRuleBasedScan, runDynamicRuleScan } from "@/lib/rules/compliance-rules"
import { analyzeConversationWithAI } from "@/lib/ai/compliance"
import { ai, MODELS } from "@/lib/ai/client"

export const maxDuration = 60

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse")
    const data = await pdfParse(buffer)
    return data.text
  } catch {
    return ""
  }
}

async function extractTextFromImage(base64Data: string, mimeType: string): Promise<string> {
  try {
    const response = await ai.chat.completions.create({
      model: MODELS.vision,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Data}` },
            },
            {
              type: "text",
              text: "Extract all text from this screenshot/image. Output only the extracted text, preserving the conversation structure.",
            },
          ],
        },
      ],
    })
    return response.choices[0]?.message?.content || ""
  } catch {
    return ""
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let inputText = ""
    const inputSources: string[] = []

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const textInput = formData.get("text") as string | null
      if (textInput) {
        inputText += textInput
        inputSources.push("text")
      }

      const files = formData.getAll("files[]") as File[]
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        if (file.type === "application/pdf") {
          const pdfText = await extractTextFromPDF(buffer)
          if (pdfText) {
            inputText += "\n\n" + pdfText
            inputSources.push(`pdf:${file.name}`)
          }
        } else if (file.type.startsWith("image/")) {
          const base64 = buffer.toString("base64")
          const imageText = await extractTextFromImage(base64, file.type)
          if (imageText) {
            inputText += "\n\n" + imageText
            inputSources.push(`image:${file.name}`)
          }
        }
      }
    } else {
      const body = await request.json()
      inputText = body.text || ""
      if (inputText) inputSources.push("text")
    }

    if (!inputText.trim()) {
      return NextResponse.json({ error: "No text content to analyze" }, { status: 400 })
    }

    // Run rule-based scan (built-in rules + DB custom rules)
    const dbRules = await complianceRules.getEnabled().catch(() => [])
    const builtinResults = runRuleBasedScan(inputText)
    const dynamicResults = runDynamicRuleScan(inputText, dbRules)
    const ruleResults = [...builtinResults, ...dynamicResults]

    // Run AI analysis
    const aiResults = await analyzeConversationWithAI(inputText, ruleResults)

    // Merge results — map rule results to same shape as AI results
    const ruleIssues = ruleResults.map((r) => ({
      severity: r.severity,
      type: r.type,
      description: `Pattern match: "${r.match}" found at position ${r.index}`,
      quotedText: r.match,
      suggestion: r.suggestion,
      policyRef: r.policyRef,
      source: "rule",
    }))

    const aiIssues = aiResults.map((i) => ({ ...i, source: "ai" }))

    // Deduplicate: remove AI issues that overlap with rule issues
    const deduplicatedAI = aiIssues.filter((aiIssue) => {
      return !ruleIssues.some(
        (ruleIssue) =>
          aiIssue.quotedText &&
          ruleIssue.quotedText &&
          (aiIssue.quotedText.toLowerCase().includes(ruleIssue.quotedText.toLowerCase()) ||
            ruleIssue.quotedText.toLowerCase().includes(aiIssue.quotedText.toLowerCase()))
      )
    })

    const allIssues = [...ruleIssues, ...deduplicatedAI]

    const hasCritical = allIssues.some((i) => i.severity === "critical")
    const hasHigh = allIssues.some((i) => i.severity === "high")
    const verdict = hasCritical || hasHigh ? "UNSAFE" : allIssues.length > 0 ? "REVIEW" : "SAFE"

    // Save to database
    const saved = await complianceChecks.insert({
      input_text: inputText.slice(0, 10000),
      input_sources: inputSources,
      results: allIssues,
      verdict,
      issues_count: allIssues.length,
    })

    return NextResponse.json({
      id: saved?.id,
      verdict,
      issues: allIssues,
      inputText: inputText.slice(0, 2000),
      issuesCount: allIssues.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Compliance check error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
