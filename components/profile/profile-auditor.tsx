"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ScoreCard } from "./score-card"
import { MetricsGrid } from "./metrics-grid"
import {
  BarChart2,
  Loader2,
  Upload,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react"

interface AuditResult {
  overallScore: number
  categories: {
    accountHealth: CategoryScore
    gigOptimization: CategoryScore
    profileStrength: CategoryScore
    reviewAnalysis: CategoryScore
    riskIndicators: CategoryScore
  }
  actionItems: ActionItem[]
  insights: string[]
  gigBreakdown: GigAudit[]
  profileData?: {
    displayName: string
    username: string
    isMock?: boolean
    gigs?: Array<{ title: string; url?: string; price?: string; rating?: number }>
  }
}

interface CategoryScore {
  score: number
  label: string
  details: string[]
  color: "green" | "yellow" | "red"
}

interface ActionItem {
  priority: "urgent" | "high" | "medium" | "low"
  title: string
  description: string
  impact: string
}

interface GigAudit {
  title: string
  url?: string
  score: number
  issues: string[]
  opportunities: string[]
}

export function ProfileAuditor() {
  const [url, setUrl] = useState("")
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [result, setResult] = useState<AuditResult | null>(null)
  const { toast } = useToast()

  async function handleAudit() {
    if (!url.trim()) {
      toast({ title: "URL required", description: "Enter your Fiverr profile URL.", variant: "destructive" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      setLoadingStep("Scraping profile...")

      let supplementaryScreenshot: string | undefined
      if (screenshotFile) {
        const reader = new FileReader()
        supplementaryScreenshot = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(screenshotFile)
        })
      }

      setLoadingStep("Analyzing with AI...")
      const response = await fetch("/api/profile/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, supplementaryScreenshot }),
      })

      if (!response.ok) throw new Error("Audit failed")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      toast({ title: "Audit failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
      setLoadingStep("")
    }
  }

  const priorityColors = {
    urgent: "destructive" as const,
    high: "destructive" as const,
    medium: "warning" as const,
    low: "secondary" as const,
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            Audit Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-url">Fiverr Profile URL</Label>
            <div className="flex gap-2">
              <Input
                id="profile-url"
                type="url"
                placeholder="https://www.fiverr.com/yourusername"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-background"
              />
              <Button onClick={handleAudit} disabled={loading} className="shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Audit"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot" className="flex items-center gap-2">
              Analytics Screenshot
              <Badge variant="outline" className="text-xs font-normal">optional</Badge>
            </Label>
            <div
              className="flex items-center gap-3 rounded-md border border-dashed border-border p-3 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => document.getElementById("screenshot-input")?.click()}
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {screenshotFile ? screenshotFile.name : "Upload analytics screenshot for deeper insights"}
                </p>
              </div>
              {screenshotFile && (
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => { e.stopPropagation(); setScreenshotFile(null) }}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              id="screenshot-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="font-medium">{loadingStep || "Starting audit..."}</p>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Mock data warning */}
          {result.profileData?.isMock && (
            <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Using mock data. Set <code className="text-xs bg-secondary px-1 rounded">SCRAPINGBEE_API_KEY</code> to enable live profile scraping.
              </p>
            </div>
          )}

          {/* Overall score */}
          <ScoreCard score={result.overallScore} profileName={result.profileData?.displayName || "Your Profile"} />

          {/* Category scores */}
          <MetricsGrid categories={result.categories} />

          {/* Action items */}
          {result.actionItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prioritized Action Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.actionItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <Badge variant={priorityColors[item.priority]} className="mt-0.5 shrink-0 text-xs">
                      {item.priority}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <p className="text-xs text-green-500">{item.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Key insights */}
          {result.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Gig breakdown */}
          {result.gigBreakdown && result.gigBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gig-by-Gig Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.gigBreakdown.map((gig, i) => (
                  <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-medium flex-1 truncate">{gig.title}</h4>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-bold ${gig.score >= 75 ? "text-green-500" : gig.score >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                          {gig.score}/100
                        </span>
                        {gig.url && (
                          <a href={gig.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <Progress value={gig.score} className="h-1.5" />
                    {gig.issues.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-400 mb-1">Issues</p>
                        <ul className="space-y-1">
                          {gig.issues.map((issue, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                              <span className="text-red-400 shrink-0">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {gig.opportunities.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-400 mb-1">Opportunities</p>
                        <ul className="space-y-1">
                          {gig.opportunities.map((opp, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                              <span className="text-green-400 shrink-0">•</span>
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
