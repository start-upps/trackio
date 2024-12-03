// src/app/api/habits/[habitId]/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { startOfMonth, subMonths } from "date-fns"
import { calculateHabitStats } from "@/lib/stats"
import type { 
  Habit, 
  HabitEntry, 
  ApiResponse,
  UpdateHabitRequest,
  HabitStats 
} from "@/types/habit"

export const runtime = 'nodejs'

// Response types
type HabitResponse = ApiResponse & {
  habit?: Habit;
  stats?: HabitStats;
  isDeleted?: boolean;
}

type HabitWithEntries = Prisma.HabitGetPayload<{
  include: { entries: true }
}>

// Helper functions
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

function handleApiError(error: unknown): NextResponse<HabitResponse> {
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

  return NextResponse.json({
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Internal Server Error"
    }
  }, { status: 500 })
}

async function validateHabitAccess(
  habitId: string, 
  userId: string,
  isDeleted = false
): Promise<HabitWithEntries | null> {
  return await db.habit.findFirst({
    where: {
      id: habitId,
      userId,
      isDeleted,
    },
    include: {
      entries: true
    }
  })
}

// Route handlers
export async function PATCH(
  req: Request,
  { params }: { params: { habitId: string } }
): Promise<NextResponse<HabitResponse>> {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: { message: "Unauthorized" }
      }, { status: 401 })
    }

    const existingHabit = await validateHabitAccess(params.habitId, userId)
    if (!existingHabit) {
      return NextResponse.json({
        success: false,
        error: { message: "Habit not found" }
      }, { status: 404 })
    }

    const data = await req.json() as UpdateHabitRequest
    const sanitizedData = {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description && { description: data.description.trim() }),
      ...(data.color && { color: data.color }),
      ...(data.icon && { icon: data.icon }),
      isDeleted: false,
      deletedAt: null
    }

    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 6))

    const habit = await db.habit.update({
      where: {
        id: params.habitId,
        userId,
      },
      data: sanitizedData,
      include: {
        entries: {
          where: { date: { gte: sixMonthsAgo } },
          orderBy: { date: 'desc' },
        },
      },
    })

    const serializedHabit = serializeHabit(habit)
    const stats = calculateHabitStats(serializedHabit)

    revalidatePath('/')
    return NextResponse.json({
      success: true,
      habit: serializedHabit,
      stats
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { habitId: string } }
): Promise<NextResponse<HabitResponse>> {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: { message: "Unauthorized" }
      }, { status: 401 })
    }

    await db.$transaction(async (tx) => {
      const habit = await validateHabitAccess(params.habitId, userId)
      if (!habit) {
        throw new Error("Habit not found")
      }

      await tx.habit.update({
        where: {
          id: params.habitId,
          userId,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      })

      await tx.habitEntry.updateMany({
        where: { habitId: params.habitId },
        data: { completed: false }
      })
    })

    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { habitId: string } }
): Promise<NextResponse<HabitResponse>> {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: { message: "Unauthorized" }
      }, { status: 401 })
    }

    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 6))
    const habit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
      },
      include: {
        entries: {
          where: {
            date: { gte: sixMonthsAgo },
            completed: true
          },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!habit) {
      return NextResponse.json({
        success: false,
        error: { message: "Habit not found" }
      }, { status: 404 })
    }

    const serializedHabit = serializeHabit(habit)
    const stats = calculateHabitStats(serializedHabit)

    return NextResponse.json({
      success: true,
      habit: serializedHabit,
      stats,
      isDeleted: habit.isDeleted
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  _req: Request,
  { params }: { params: { habitId: string } }
): Promise<NextResponse<HabitResponse>> {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: { message: "Unauthorized" }
      }, { status: 401 })
    }

    const habit = await validateHabitAccess(params.habitId, userId, true)
    if (!habit) {
      return NextResponse.json({
        success: false,
        error: { message: "Deleted habit not found" }
      }, { status: 404 })
    }

    const restoredHabit = await db.$transaction(async (tx) => {
      return await tx.habit.update({
        where: {
          id: params.habitId,
          userId,
        },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
        include: {
          entries: true,
        },
      })
    })

    const serializedHabit = serializeHabit(restoredHabit)

    revalidatePath('/')
    return NextResponse.json({
      success: true,
      habit: serializedHabit
    })
  } catch (error) {
    return handleApiError(error)
  }
}
