import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }
  await createSession()
  return NextResponse.json({ success: true })
}
