"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search, Plus, Library, Copy, Check, Trash2, MessageSquare,
  DollarSign, RotateCcw, AlertCircle, CheckCircle, MessageCircle,
  Star, Zap, Package, ChevronDown, ChevronUp
} from "lucide-react"
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

const scenarios = [
  { value: "first_reply", label: "First Reply", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { value: "scope_clarification", label: "Scope Clarification", icon: Search, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { value: "price_negotiation", label: "Price Negotiation", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  { value: "revision", label: "Revision Request", icon: RotateCcw, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { value: "dispute", label: "Dispute", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  { value: "order_completion", label: "Order Completion", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { value: "delivery", label: "Delivery", icon: Package, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { value: "upsell", label: "Upsell", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { value: "repeat_buyer", label: "Repeat Buyer", icon: Star, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { value: "rush", label: "Rush Order", icon: Zap, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { value: "custom_offer", label: "Custom Offer", icon: MessageCircle, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
]

function getScenarioConfig(scenario: string) {
  const normalise = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, "_")
  return scenarios.find(s => normalise(s.value) === normalise(scenario)) || {
    value: scenario, label: scenario, icon: MessageSquare,
    color: "text-muted-foreground", bg: "bg-secondary", border: "border-border"
  }
}

function TemplateCard({ template, onDelete, onUse }: {
  template: Template
  onDelete: (id: string) => void
  onUse: (id: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const config = getScenarioConfig(template.scenario)
  const Icon = config.icon

  async function handleCopy() {
    await navigator.clipboard.writeText(template.content)
    setCopied(true)
    onUse(template.id)
    fetch("/api/templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: template.id, use_count: (Number(template.use_count) || 0) + 1 }),
    }).catch(() => {})
    setTimeout(() => setCopied(false), 2000)
  }

  const preview = template.content.slice(0, 120) + (template.content.length > 120 ? "..." : "")
  const tags = Array.isArray(template.tags) ? template.tags : []

  return (
    <Card className="group hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Top accent bar */}
      <div className={cn("h-0.5", config.bg.replace("/10", "").replace("bg-", "bg-"))} />

      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            config.bg, config.border
          )}>
            <Icon className={cn("h-3.5 w-3.5", config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold leading-tight text-foreground truncate">{template.title}</h3>
            <span className={cn("text-xs font-medium mt-0.5", config.color)}>{config.label}</span>
          </div>
        </div>

        {/* Content preview */}
        <div
          className="rounded-lg bg-secondary/50 border border-border p-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <p className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">
            {expanded ? template.content : preview}
          </p>
          {template.content.length > 120 && (
            <button className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
              {expanded ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Show full template</>}
            </button>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center gap-2">
            {template.compliance_checked && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                <CheckCircle className="h-3 w-3" />
                Safe
              </span>
            )}
            {Number(template.use_count) > 0 && (
              <span className="text-xs text-muted-foreground">
                Used {template.use_count}×
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(template.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={handleCopy}
            >
              {copied ? <><Check className="h-3.5 w-3.5" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeScenario, setActiveScenario] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: "", scenario: "", content: "", tags: "" })
  const { toast } = useToast()

  async function fetchTemplates() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeScenario !== "all") params.set("scenario", activeScenario)
      if (search) params.set("search", search)
      const res = await fetch(`/api/templates?${params}`)
      const data = await res.json()
      setTemplates(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTemplates() }, [activeScenario, search])

  async function handleAddTemplate() {
    if (!form.title || !form.scenario || !form.content) {
      toast({ title: "Fill all required fields", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Template added!" })
      setShowAddDialog(false)
      setForm({ title: "", scenario: "", content: "", tags: "" })
      await fetchTemplates()
    } catch {
      toast({ title: "Failed to save template", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return
    try {
      await fetch(`/api/templates?id=${id}`, { method: "DELETE" })
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      toast({ title: "Template deleted" })
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    }
  }

  const handleUse = (id: string) => {
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, use_count: (Number(t.use_count) || 0) + 1 } : t))
  }

  // Count per scenario (from full unfiltered list when no search)
  const scenarioCounts = scenarios.reduce((acc, s) => {
    const normalise = (str: string) => str.toLowerCase().replace(/[\s_-]+/g, "_")
    acc[s.value] = templates.filter(t => normalise(String(t.scenario)) === normalise(s.value)).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-5">
      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Template
        </Button>
      </div>

      {/* Scenario filter pills */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setActiveScenario("all")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all border",
              activeScenario === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Library className="h-3.5 w-3.5" />
            All
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
              activeScenario === "all" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary"
            )}>
              {templates.length}
            </span>
          </button>
          {scenarios.map((s) => {
            const Icon = s.icon
            const isActive = activeScenario === s.value
            return (
              <button
                key={s.value}
                onClick={() => setActiveScenario(s.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all border whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary-foreground" : s.color)} />
                {s.label}
                {scenarioCounts[s.value] > 0 && (
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}>
                    {scenarioCounts[s.value]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Templates grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-lg" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-7 w-20 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <Library className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">No templates found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {search ? "Try a different search term" : "Add your first template or clear the filter"}
            </p>
            {!search && (
              <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDelete={handleDelete}
              onUse={handleUse}
            />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg w-full mx-2 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Template title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Scenario *</Label>
              <Select value={form.scenario} onValueChange={(v) => setForm({ ...form, scenario: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((s) => {
                    const Icon = s.icon
                    return (
                      <SelectItem key={s.value} value={s.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-3.5 w-3.5", s.color)} />
                          {s.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea placeholder="Write your template here. Use {{buyer_name}} for placeholders..."
                value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="min-h-[200px] bg-background font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Tags <span className="text-muted-foreground">(comma-separated)</span></Label>
              <Input placeholder="e.g., professional, quick-reply" value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })} className="bg-background" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddTemplate} disabled={saving}>
              {saving ? "Saving..." : "Add Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
