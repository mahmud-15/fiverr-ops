"use client"

import { useEffect, useState } from "react"

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function formatDateTime(date: Date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const day = days[date.getDay()]
  const month = months[date.getMonth()]
  const d = date.getDate()
  const year = date.getFullYear()
  const h = pad(date.getHours())
  const m = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  return { date: `${day}, ${month} ${d}, ${year}`, time: `${h}:${m}:${s}` }
}

export function HeaderRight() {
  const [now, setNow] = useState<{ date: string; time: string } | null>(null)

  useEffect(() => {
    function tick() {
      setNow(formatDateTime(new Date()))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (!now) return null

  return (
    <div className="leading-tight text-sm text-right" suppressHydrationWarning>
      <p className="text-foreground font-medium tabular-nums" suppressHydrationWarning>{now.time}</p>
      <p className="hidden sm:block text-xs text-muted-foreground" suppressHydrationWarning>{now.date}</p>
    </div>
  )
}
