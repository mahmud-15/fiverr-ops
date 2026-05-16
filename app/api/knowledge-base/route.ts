import { NextRequest, NextResponse } from "next/server"
import { kbArticles } from "@/lib/sheets/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let all = await kbArticles.getAll()

    if (category && category !== "all") {
      all = all.filter((a) => a.category === category)
    }

    // Sort by created_at descending
    all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ data: all })
  } catch (error) {
    console.error("KB GET error:", error)
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, category, tags, source } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    const data = await kbArticles.insert({ title, content, category, tags: tags || [], source })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("KB POST error:", error)
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const data = await kbArticles.update(id, updates)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("KB PATCH error:", error)
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await kbArticles.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("KB DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 })
  }
}
