"use client"

import { useEffect, useState } from "react"

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function GreetingClock() {
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    function update() {
      setGreeting(getGreeting(new Date().getHours()))
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!greeting) return null

  return (
    <span>{greeting}, Mahmud</span>
  )
}
