"use client"

import { useEffect, useState } from "react"

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) return "Good morning"
  if (hour >= 12 && hour < 17) return "Good afternoon"
  if (hour >= 17 && hour < 21) return "Good evening"
  return "Good night"
}

export function GreetingClock() {
  const [greeting, setGreeting] = useState("Welcome back")

  useEffect(() => {
    function update() {
      setGreeting(getGreeting(new Date().getHours()))
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  return <span suppressHydrationWarning>{greeting}, Mahmud</span>
}
