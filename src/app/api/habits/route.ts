// src/app/api/habits/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import type { 
  Habit, 
  HabitEntry, 
  CreateHabitRequest, 
  ApiResponse 
} from "@/types/habit"

export const runtime = 'nodejs'

type HabitWithEntries = Prisma.HabitGetPayload<{
  include: { entries: true }
}>

function serializeHabit(habit: HabitWithEntries): Habit {
  return {
    ...habit,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
    deletedAt: habit.deletedAt?.toISOString() || undefined,
    entries: habit.entries.map((entry): HabitEntry => ({
      ...entry,
      date: entry.date.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }))
  }
}

function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json({
          success: false,
          error: {
            message: "A habit with this name already exists",
            code: error.code
          }
        }, { status: 409 })
      case 'P2025':
        return NextResponse.json({
          success: false,
          error: {
            message: "Habit not found",
            code: error.code
          }
        }, { status: 404 })
      default:
        return NextResponse.json({
          success: false,
          error: {
            message: "Database error",
            code: error.code,
            details: error.message
          }
        }, { status: 500 })
    }
  }
  
  if (error instanceof SyntaxError) {
    return NextResponse.json({
      success: false,
      error: {
        message: "Invalid request data",
        details: error.message
      }
    }, { status: 400 })
  }

  return NextResponse.json({
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Internal Server Error"
    }
  }, { status: 500 })
}

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: { message: "Unauthorized" }
      }, { status: 401 })
    }

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

    return NextResponse.json({
      success: true,
      habits: habits.map(serializeHabit)
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: { message: "Unauthorized" }
      }, { status: 401 })
    }

    const body = await req.json() as CreateHabitRequest
    
    const { 
      name, 
      description, 
      color = "#E040FB", 
      icon = "📝" 
    } = body

    if (!name?.trim() || !description?.trim()) {
      return NextResponse.json({
        success: false,
        error: { message: "Missing required fields" }
      }, { status: 400 })
    }

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

    revalidatePath('/')

    return NextResponse.json({
      success: true,
      habit: serializeHabit(habit)
    })
  } catch (error) {
    return handleApiError(error)
  }
}