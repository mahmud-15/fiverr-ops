"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Trash2, ShieldCheck, ToggleLeft, ToggleRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Rule {
  id: string
  type: string
  pattern: string
  severity: "critical" | "high" | "medium" | "low"
  suggestion: string
  policy_ref: string
  is_enabled: boolean | string
  is_regex: boolean | string
  created_at: string
}

const SEVERITY_COLORS = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
} as const

const EMPTY_FORM = {
  type: "",
  pattern: "",
  severity: "high" as Rule["severity"],
  suggestion: "",
  policy_ref: "",
  is_regex: true,
  is_enabled: true,
}

export function ComplianceRulesManager() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const { toast } = useToast()

  async function fetchRules() {
    setLoading(true)
    try {
      const res = await fetch("/api/compliance/rules")
      const data = await res.json()
      setRules(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRules() }, [])

  function openAdd() {
    setEditingRule(null)
    setForm(EMPTY_FORM)
    setShowDialog(true)
  }

  function openEdit(rule: Rule) {
    setEditingRule(rule)
    setForm({
      type: rule.type,
      pattern: rule.pattern,
      severity: rule.severity,
      suggestion: rule.suggestion,
      policy_ref: rule.policy_ref,
      is_regex: rule.is_regex === true || String(rule.is_regex) === "true",
      is_enabled: rule.is_enabled === true || String(rule.is_enabled) === "true",
    })
    setShowDialog(true)
  }

  async function handleSave() {
    if (!form.type || !form.pattern || !form.suggestion) {
      toast({ title: "Fill all required fields", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      if (editingRule) {
        await fetch("/api/compliance/rules", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingRule.id, ...form }),
        })
        toast({ title: "Rule updated" })
      } else {
        await fetch("/api/compliance/rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        toast({ title: "Rule created" })
      }
      setShowDialog(false)
      await fetchRules()
    } catch {
      toast({ title: "Save failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this rule?")) return
    try {
      await fetch(`/api/compliance/rules?id=${id}`, { method: "DELETE" })
      setRules((prev) => prev.filter((r) => r.id !== id))
      toast({ title: "Rule deleted" })
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    }
  }

  async function handleToggle(rule: Rule) {
    const isEnabled = rule.is_enabled === true || String(rule.is_enabled) === "true"
    try {
      await fetch("/api/compliance/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, is_enabled: !isEnabled }),
      })
      setRules((prev) =>
        prev.map((r) => r.id === rule.id ? { ...r, is_enabled: !isEnabled } : r)
      )
    } catch {
      toast({ title: "Toggle failed", variant: "destructive" })
    }
  }

  const enabledCount = rules.filter(
    (r) => r.is_enabled === true || String(r.is_enabled) === "true"
  ).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Custom Compliance Rules</p>
            <p className="text-xs text-muted-foreground">
              {enabledCount} of {rules.length} rules enabled — applied on top of built-in patterns
            </p>
          </div>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
        <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Rules added here are applied alongside the 35+ built-in patterns during every compliance check.
          Use regex patterns for flexible matching (e.g. <code className="font-mono bg-secondary px-1 rounded">my\s*number\s*is</code>)
          or plain text for exact phrases. Changes take effect immediately — no redeployment needed.
        </p>
      </div>

      {/* Rules list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No custom rules yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add rules to catch phrases specific to your business
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const enabled = rule.is_enabled === true || String(rule.is_enabled) === "true"
            const isRegex = rule.is_regex === true || String(rule.is_regex) === "true"
            return (
              <Card
                key={rule.id}
                className={cn("transition-opacity", !enabled && "opacity-50")}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{rule.type}</span>
                        <Badge variant={SEVERITY_COLORS[rule.severity] as "destructive" | "secondary" | "outline"} className="text-xs">
                          {rule.severity}
                        </Badge>
                        {isRegex && (
                          <Badge variant="outline" className="text-xs font-mono">regex</Badge>
                        )}
                        {!enabled && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">disabled</Badge>
                        )}
                      </div>
                      <code className="text-xs font-mono text-muted-foreground block truncate bg-secondary/50 px-2 py-0.5 rounded">
                        {rule.pattern}
                      </code>
                      <p className="text-xs text-muted-foreground truncate">{rule.suggestion}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggle(rule)}
                        title={enabled ? "Disable rule" : "Enable rule"}
                      >
                        {enabled
                          ? <ToggleRight className="h-4 w-4 text-green-500" />
                          : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(rule)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg w-full mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Rule" : "Add Compliance Rule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Type / Name *</Label>
              <Input
                placeholder="e.g., Competitor Mention, Off-Platform Contact"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pattern *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Regex</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_regex: !form.is_regex })}
                    className="text-primary"
                  >
                    {form.is_regex
                      ? <ToggleRight className="h-5 w-5 text-green-500" />
                      : <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    }
                  </button>
                </div>
              </div>
              <Input
                placeholder={form.is_regex ? "e.g., my\\s*number\\s*is|call me at" : "e.g., let's talk on whatsapp"}
                value={form.pattern}
                onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                className="bg-background font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {form.is_regex
                  ? "JavaScript regex syntax, case-insensitive. Use \\s* for whitespace, | for OR."
                  : "Plain text match — exact phrase, case-insensitive."}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Severity *</Label>
              <Select
                value={form.severity}
                onValueChange={(v) => setForm({ ...form, severity: v as Rule["severity"] })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical — block send</SelectItem>
                  <SelectItem value="high">High — strong warning</SelectItem>
                  <SelectItem value="medium">Medium — caution</SelectItem>
                  <SelectItem value="low">Low — note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Suggestion *</Label>
              <Textarea
                placeholder="What should the user do instead?"
                value={form.suggestion}
                onChange={(e) => setForm({ ...form, suggestion: e.target.value })}
                className="min-h-[80px] bg-background text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Policy Reference</Label>
              <Input
                placeholder="e.g., Fiverr TOS §3.1 - Contact Information"
                value={form.policy_ref}
                onChange={(e) => setForm({ ...form, policy_ref: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingRule ? "Update Rule" : "Add Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
