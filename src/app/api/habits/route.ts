// src/app/api/habits/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"

export const runtime = 'nodejs'

export async function GET() {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const habits = await db.habit.findMany({
      where: { userId },
      include: {
        entries: {
          orderBy: { date: "desc" },
          take: 28,
        },
      },
    })

    return NextResponse.json(habits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name, description, color = "#E040FB", icon = "📝" } = await req.json()

    if (!name || !description) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const habit = await db.habit.create({
      data: {
        name,
        description,
        color,
        icon,
        userId
      }
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error creating habit:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
