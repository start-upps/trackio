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

    // Only get non-deleted habits
    const habits = await db.habit.findMany({
      where: { 
        userId,
        isDeleted: false
      },
      include: {
        entries: {
          orderBy: { date: "desc" },
          take: 28,
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const serializedHabits = habits.map(habit => ({
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
      deletedAt: habit.deletedAt?.toISOString() || undefined,
      entries: habit.entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
    }))

    return NextResponse.json({
      success: true,
      habits: serializedHabits
    })
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

    // Create the habit with isDeleted initialized to false
    const habit = await db.habit.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        color,
        icon,
        userId,
        isDeleted: false
      },
      include: {
        entries: true
      }
    })

    // Serialize the habit for response
    const serializedHabit = {
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
      deletedAt: habit.deletedAt?.toISOString() || undefined,
      entries: habit.entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      }))
    }

    revalidatePath('/')

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

// Helper function for consistent habit serialization
function serializeHabit(habit: any) {
  return {
    ...habit,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
    deletedAt: habit.deletedAt?.toISOString() || undefined,
    entries: habit.entries?.map((entry: any) => ({
      ...entry,
      date: entry.date.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    })) || []
  }
}

// Helper function for error responses
function handleError(error: unknown) {
  console.error('Error:', error)
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new NextResponse("A habit with this name already exists", { status: 409 })
      case 'P2025':
        return new NextResponse("Habit not found", { status: 404 })
      default:
        return new NextResponse(`Database error: ${error.code}`, { status: 500 })
    }
  }

  return new NextResponse(
    error instanceof Error ? error.message : "Internal Error", 
    { status: 500 }
  )
}