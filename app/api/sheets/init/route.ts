import { NextResponse } from "next/server"
import { initializeSpreadsheet } from "@/lib/sheets/init"

export async function GET() {
  const result = await initializeSpreadsheet()
  const status = result.success ? 200 : 500
  return NextResponse.json(result, { status })
}
