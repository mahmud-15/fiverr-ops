import { NextRequest, NextResponse } from "next/server"
import { projects } from "@/lib/sheets/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let all = await projects.getAll()

    if (status && status !== "all") {
      all = all.filter((p) => p.status === status)
    }

    // Sort by updated_at descending
    all.sort((a, b) => {
      const dateA = a.updated_at || a.created_at
      const dateB = b.updated_at || b.created_at
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    return NextResponse.json({ data: all })
  } catch (error) {
    console.error("Projects GET error:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyer_name, title, status, budget, deadline, description, notes, order_id, platform_link, tags } = body

    if (!buyer_name || !title) {
      return NextResponse.json(
        { error: "Buyer name and title are required" },
        { status: 400 }
      )
    }

    const data = await projects.insert({
      buyer_name,
      title,
      status: status || "active",
      budget: budget || null,
      deadline: deadline || null,
      description,
      notes,
      order_id,
      platform_link,
      tags: tags || [],
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Projects POST error:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const data = await projects.update(id, updates)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Projects PATCH error:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await projects.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Projects DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
