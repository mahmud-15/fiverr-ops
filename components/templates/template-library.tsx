"use client"

import { useState, useEffect } from "react"
import { TemplateCard } from "./template-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Library } from "lucide-react"

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
  "First Reply",
  "Scope Clarification",
  "Price Negotiation",
  "Revision Request",
  "Dispute",
  "Order Completion",
]

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

  useEffect(() => {
    fetchTemplates()
  }, [activeScenario, search])

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
    setTemplates((prev) =>
      prev.map((t) => t.id === id ? { ...t, use_count: t.use_count + 1 } : t)
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Template
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setActiveScenario("all")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeScenario === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {scenarios.map((s) => (
          <button
            key={s}
            onClick={() => setActiveScenario(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeScenario === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Library className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-medium">No templates found</h3>
          <p className="text-sm text-muted-foreground mt-1">Add your first template or clear the search filter</p>
        </div>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Template title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Scenario *</Label>
              <Select value={form.scenario} onValueChange={(v) => setForm({ ...form, scenario: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template Content *</Label>
              <Textarea
                placeholder="Write your template here..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="min-h-[180px] bg-background font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="e.g., professional, negotiation, quick-reply"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="bg-background"
              />
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
