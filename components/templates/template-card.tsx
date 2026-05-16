"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check, ShieldCheck, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Template {
  id: string
  title: string
  scenario: string
  content: string
  tags: string[]
  use_count: number
  compliance_checked: boolean
}

const scenarioColors: Record<string, string> = {
  "First Reply": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Scope Clarification": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Price Negotiation": "bg-green-500/10 text-green-400 border-green-500/20",
  "Revision Request": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Dispute": "bg-red-500/10 text-red-400 border-red-500/20",
  "Order Completion": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
}

interface TemplateCardProps {
  template: Template
  onDelete?: (id: string) => void
  onUse?: (id: string) => void
}

export function TemplateCard({ template, onDelete, onUse }: TemplateCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(template.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    // Increment use count
    try {
      await fetch("/api/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: template.id, use_count: template.use_count + 1 }),
      })
      onUse?.(template.id)
    } catch {
      // ignore
    }
  }

  const scenarioStyle = scenarioColors[template.scenario] || "bg-secondary text-muted-foreground"
  const preview = template.content.slice(0, 150)

  return (
    <Card className="hover:border-primary/20 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 flex-1 min-w-0">
            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", scenarioStyle)}>
              {template.scenario}
            </span>
            <h3 className="font-medium text-sm leading-snug">{template.title}</h3>
          </div>
          {template.compliance_checked && (
            <div title="Compliance checked">
              <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Preview */}
        <div
          className="cursor-pointer rounded bg-secondary/50 p-3"
          onClick={() => setExpanded(!expanded)}
        >
          <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {expanded ? template.content : preview + (template.content.length > 150 ? "..." : "")}
          </p>
          {template.content.length > 150 && (
            <p className="text-xs text-primary mt-2">{expanded ? "Show less" : "Show more"}</p>
          )}
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{template.use_count} uses</span>
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(template.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button size="sm" className="h-7 text-xs" onClick={handleCopy}>
              {copied ? <><Check className="h-3 w-3" />Copied!</> : <><Copy className="h-3 w-3" />Copy</>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
