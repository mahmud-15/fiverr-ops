"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileSearch,
  Loader2,
  CheckSquare,
  AlertTriangle,
  HelpCircle,
  DollarSign,
  Package,
  Copy,
  Check,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BriefAnalysis {
  requirements: Array<{ item: string; category: string; isExplicit: boolean }>
  missingInfo: Array<{ topic: string; importance: "critical" | "important" | "nice-to-have"; question: string }>
  scopeRisks: Array<{ risk: string; severity: "high" | "medium" | "low"; mitigation: string }>
  suggestedPriceRange: { min: number; max: number; recommended: number; currency: string; rationale: string }
  clarifyingQuestions: Array<{ question: string; purpose: string; priority: number }>
  deliverables: Array<{ item: string; format?: string; isExplicit: boolean }>
  complexity: "simple" | "moderate" | "complex"
  estimatedTimeline: string
}

export function BriefAnalyzer() {
  const [briefText, setBriefText] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<BriefAnalysis | null>(null)
  const [copiedQuestion, setCopiedQuestion] = useState<number | null>(null)
  const { toast } = useToast()

  async function handleAnalyze() {
    if (!briefText.trim()) {
      toast({ title: "Brief required", description: "Paste the client brief to analyze.", variant: "destructive" })
      return
    }
    setLoading(true)
    setAnalysis(null)
    try {
      const res = await fetch("/api/brief/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefText }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAnalysis(data.analysis)
    } catch {
      toast({ title: "Analysis failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function copyQuestion(question: string, index: number) {
    await navigator.clipboard.writeText(question)
    setCopiedQuestion(index)
    setTimeout(() => setCopiedQuestion(null), 2000)
  }

  const importanceColors = {
    critical: "destructive" as const,
    important: "warning" as const,
    "nice-to-have": "secondary" as const,
  }

  const riskColors = {
    high: "destructive" as const,
    medium: "warning" as const,
    low: "secondary" as const,
  }

  const complexityColors = {
    simple: "success" as const,
    moderate: "warning" as const,
    complex: "destructive" as const,
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-primary" />
            Client Brief
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste the client's project brief or message here..."
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            className="min-h-[200px] resize-none font-mono text-sm bg-background"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{briefText.length} characters</span>
            <Button onClick={handleAnalyze} disabled={loading || !briefText.trim()}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</> : <><FileSearch className="h-4 w-4" />Analyze Brief</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-5">
          {/* Overview */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Complexity</p>
                <Badge variant={complexityColors[analysis.complexity]} className="text-sm capitalize">
                  {analysis.complexity}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                <p className="text-sm font-medium">{analysis.estimatedTimeline}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Price Range</p>
                <p className="text-sm font-medium">${analysis.suggestedPriceRange.min}–${analysis.suggestedPriceRange.max}</p>
              </CardContent>
            </Card>
          </div>

          {/* Requirements */}
          {analysis.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  Extracted Requirements ({analysis.requirements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckSquare className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm">{req.item}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">{req.category}</Badge>
                          {!req.isExplicit && <span className="text-xs text-muted-foreground italic">implied</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Missing info */}
          {analysis.missingInfo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-yellow-500" />
                  Missing Information ({analysis.missingInfo.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.missingInfo.map((info, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <Badge variant={importanceColors[info.importance]} className="mt-0.5 text-xs shrink-0">
                      {info.importance}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{info.topic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{info.question}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Scope risks */}
          {analysis.scopeRisks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Scope Risks ({analysis.scopeRisks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.scopeRisks.map((risk, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-lg border space-y-2",
                    risk.severity === "high" ? "bg-red-500/5 border-red-500/20" :
                    risk.severity === "medium" ? "bg-yellow-500/5 border-yellow-500/20" :
                    "bg-blue-500/5 border-blue-500/20"
                  )}>
                    <div className="flex items-center gap-2">
                      <Badge variant={riskColors[risk.severity]} className="text-xs">{risk.severity}</Badge>
                      <p className="text-sm font-medium">{risk.risk}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">Mitigation:</span> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Price range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Suggested Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Minimum</p>
                  <p className="text-xl font-bold">${analysis.suggestedPriceRange.min}</p>
                </div>
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Recommended</p>
                  <p className="text-xl font-bold text-primary">${analysis.suggestedPriceRange.recommended}</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Maximum</p>
                  <p className="text-xl font-bold">${analysis.suggestedPriceRange.max}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.suggestedPriceRange.rationale}</p>
            </CardContent>
          </Card>

          {/* Clarifying questions */}
          {analysis.clarifyingQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-500" />
                  Clarifying Questions (copy-ready)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.clarifyingQuestions
                  .sort((a, b) => a.priority - b.priority)
                  .map((q, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border group">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {q.priority}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{q.question}</p>
                        <p className="text-xs text-muted-foreground mt-1">{q.purpose}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyQuestion(q.question, i)}
                      >
                        {copiedQuestion === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {analysis.deliverables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  Expected Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.deliverables.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm">{d.item}</span>
                      {d.format && <Badge variant="outline" className="text-xs">{d.format}</Badge>}
                      {!d.isExplicit && <span className="text-xs text-muted-foreground italic">implied</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
