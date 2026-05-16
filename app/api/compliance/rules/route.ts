import { NextRequest, NextResponse } from "next/server"
import { complianceRules } from "@/lib/sheets/db"

export async function GET() {
  try {
    const rules = await complianceRules.getAll()
    return NextResponse.json({ data: rules })
  } catch (error) {
    console.error("Get rules error:", error)
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rule = await complianceRules.insert({
      type: body.type,
      pattern: body.pattern,
      severity: body.severity,
      suggestion: body.suggestion,
      policy_ref: body.policy_ref,
      is_enabled: body.is_enabled !== false,
      is_regex: body.is_regex !== false,
    })
    return NextResponse.json({ data: rule })
  } catch (error) {
    console.error("Create rule error:", error)
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const rule = await complianceRules.update(id, updates)
    return NextResponse.json({ data: rule })
  } catch (error) {
    console.error("Update rule error:", error)
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await complianceRules.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete rule error:", error)
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 })
  }
}
