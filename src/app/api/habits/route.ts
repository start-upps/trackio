// src/app/api/habits/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export const runtime = 'nodejs'

export async function GET() {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all habits, including non-archived ones first, then sorted by creation date
    const habits = await db.habit.findMany({
      where: { 
        userId,
      },
      include: {
        entries: {
          orderBy: { date: "desc" },
          take: 28,
        },
      },
      orderBy: [
        { archived: 'asc' },  // Non-archived habits first
        { createdAt: 'desc' } // Most recent habits first
      ]
    })

    // Convert dates to ISO strings for serialization
    const serializedHabits = habits.map(habit => ({
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
      entries: habit.entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
    }))

    return NextResponse.json(serializedHabits)
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

    const body = await req.json()
    
    const { name, description, color = "#E040FB", icon = "📝" } = body

    if (!name?.trim() || !description?.trim()) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create the new habit
    const habit = await db.habit.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        color,
        icon,
        userId
      },
      include: {
        entries: true // Include entries in the response
      }
    })

    // Convert dates to ISO strings for serialization
    const serializedHabit = {
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
      entries: habit.entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
    }

    // Force revalidation of the page
    revalidatePath('/', 'page')

    return NextResponse.json({
      success: true,
      habit: serializedHabit
    })
  } catch (error) {
    console.error('Error creating habit:', error)
    
    if (error instanceof SyntaxError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new NextResponse("A habit with this name already exists", { status: 409 })
      }
    }

    return new NextResponse("Internal Error", { status: 500 })
  }
}