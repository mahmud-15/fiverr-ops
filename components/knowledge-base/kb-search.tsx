"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, Bot } from "lucide-react"

interface KbSearchProps {
  onResults: (articles: unknown[], answer: string) => void
}

export function KbSearch({ onResults }: KbSearchProps) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/knowledge-base/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      onResults(data.results || [], data.answer || "")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Ask anything about Fiverr policies, best practices..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>
      <Button type="submit" disabled={loading || !query.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
        Search
      </Button>
    </form>
  )
}
