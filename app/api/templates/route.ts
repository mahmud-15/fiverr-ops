import { NextRequest, NextResponse } from "next/server"
import { templates } from "@/lib/sheets/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scenario = searchParams.get("scenario")
    const search = searchParams.get("search")

    let all = await templates.getAll()

    if (scenario && scenario !== "all") {
      all = all.filter((t) => t.scenario === scenario)
    }

    if (search) {
      const q = search.toLowerCase()
      all = all.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.content?.toLowerCase().includes(q)
      )
    }

    // Sort by use_count descending
    all.sort((a, b) => (Number(b.use_count) || 0) - (Number(a.use_count) || 0))

    return NextResponse.json({ data: all })
  } catch (error) {
    console.error("Templates GET error:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, scenario, content, tags } = body

    if (!title || !scenario || !content) {
      return NextResponse.json(
        { error: "Title, scenario, and content are required" },
        { status: 400 }
      )
    }

    const data = await templates.insert({ title, scenario, content, tags: tags || [], use_count: 0, compliance_checked: false })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Templates POST error:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const data = await templates.update(id, updates)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Templates PATCH error:", error)
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await templates.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Templates DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}
