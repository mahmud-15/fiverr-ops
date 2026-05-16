"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ResultsPanel } from "./results-panel"
import { FileUploadZone } from "./file-upload"
import {
  ShieldCheck,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react"

interface Issue {
  severity: "critical" | "high" | "medium" | "low"
  type: string
  description: string
  quotedText: string
  suggestion: string
  policyRef: string
  source?: string
}

interface CheckResult {
  id: string
  verdict: "SAFE" | "UNSAFE" | "REVIEW"
  issues: Issue[]
  issuesCount: number
  timestamp: string
}

export function ComplianceChecker() {
  const [text, setText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const { toast } = useToast()

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles)
  }, [])

  async function handleCheck() {
    if (!text.trim() && files.length === 0) {
      toast({
        title: "Nothing to check",
        description: "Please paste text or upload files to analyze.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      if (text.trim()) formData.append("text", text)
      files.forEach((file) => formData.append("files[]", file))

      const response = await fetch("/api/compliance/check", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Check failed")

      const data = await response.json()
      setResult(data)

      toast({
        title: `Compliance Check: ${data.verdict}`,
        description: `Found ${data.issuesCount} issue${data.issuesCount !== 1 ? "s" : ""}.`,
        variant: data.verdict === "UNSAFE" ? "destructive" : "default",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Check failed",
        description: "Unable to analyze. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setText("")
    setFiles([])
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Text input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Paste Conversation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your Fiverr conversation, message, or any text you want to check for policy compliance..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[240px] resize-none font-mono text-sm bg-background"
            />
            {text && (
              <p className="text-xs text-muted-foreground mt-2">
                {text.length.toLocaleString()} characters
              </p>
            )}
          </CardContent>
        </Card>

        {/* File upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upload Screenshots or PDFs</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadZone onFilesChange={handleFilesChange} files={files} />
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleCheck}
          disabled={loading || (!text.trim() && files.length === 0)}
          className="min-w-[160px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Check Compliance
            </>
          )}
        </Button>
        {(text || files.length > 0 || result) && (
          <Button variant="outline" onClick={handleClear} disabled={loading}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium">Analyzing content...</p>
              <p className="text-xs text-muted-foreground">
                Running rule-based scan and AI analysis. This may take a moment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Verdict banner */}
          <div
            className={`flex items-center gap-3 rounded-lg border p-4 ${
              result.verdict === "SAFE"
                ? "bg-green-500/10 border-green-500/20"
                : result.verdict === "UNSAFE"
                ? "bg-red-500/10 border-red-500/20"
                : "bg-yellow-500/10 border-yellow-500/20"
            }`}
          >
            {result.verdict === "SAFE" ? (
              <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
            ) : result.verdict === "UNSAFE" ? (
              <XCircle className="h-6 w-6 text-red-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  {result.verdict === "SAFE"
                    ? "Content is Compliant"
                    : result.verdict === "UNSAFE"
                    ? "Policy Violations Found"
                    : "Review Recommended"}
                </h3>
                <Badge
                  variant={
                    result.verdict === "SAFE"
                      ? "success"
                      : result.verdict === "UNSAFE"
                      ? "destructive"
                      : "warning"
                  }
                >
                  {result.verdict}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {result.verdict === "SAFE"
                  ? "No policy violations detected in this content."
                  : `Found ${result.issuesCount} issue${result.issuesCount !== 1 ? "s" : ""} that need your attention.`}
              </p>
            </div>
          </div>

          {/* Issues list */}
          {result.issues.length > 0 && <ResultsPanel issues={result.issues} />}
        </div>
      )}
    </div>
  )
}
