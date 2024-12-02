// src/app/api/habits/[habitId]/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { startOfMonth, subMonths } from "date-fns"
import { calculateHabitStats } from "@/lib/stats"

export const runtime = 'nodejs'

// Update habit
export async function PATCH(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // First verify habit exists and belongs to user and is not deleted
    const existingHabit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
        isDeleted: false,
      },
    })

    if (!existingHabit) {
      return new NextResponse("Habit not found", { status: 404 })
    }

    const data = await req.json()
    
    // Validate and sanitize input data
    const sanitizedData = {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description && { description: data.description.trim() }),
      ...(data.color && { color: data.color }),
      ...(data.icon && { icon: data.icon }),
    }

    // Get data from 6 months ago
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 6));

    const habit = await db.habit.update({
      where: {
        id: params.habitId,
        userId,
        isDeleted: false,
      },
      data: sanitizedData,
      include: {
        entries: {
          where: {
            date: {
              gte: sixMonthsAgo
            }
          },
          orderBy: {
            date: 'desc'
          },
        },
      },
    })

    // Calculate stats for the updated habit
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
    };

    const stats = calculateHabitStats(serializedHabit);

    revalidatePath('/')
    return NextResponse.json({
      success: true,
      habit: serializedHabit,
      stats,
      message: "Habit updated successfully"
    })
  } catch (error) {
    console.error('Error updating habit:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new NextResponse("A habit with this name already exists", { status: 409 })
      }
    }
    
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error", 
      { status: 500 }
    )
  }
}

// Soft delete habit
export async function DELETE(
  _req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // First verify habit exists and belongs to user and is not already deleted
    const habit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
        isDeleted: false,
      },
    })

    if (!habit) {
      return new NextResponse("Habit not found", { status: 404 })
    }

    // Perform soft delete
    await db.habit.update({
      where: {
        id: params.habitId,
        userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    revalidatePath('/')
    return NextResponse.json({
      success: true,
      message: "Habit deleted successfully"
    })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error", 
      { status: 500 }
    )
  }
}

// GET single habit
export async function GET(
  _req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get data from 6 months ago
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 6));

    const habit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
        isDeleted: false,
      },
      include: {
        entries: {
          where: {
            date: {
              gte: sixMonthsAgo
            }
          },
          orderBy: {
            date: 'desc'
          },
        },
      },
    })

    if (!habit) {
      return new NextResponse("Habit not found", { status: 404 })
    }

    // Serialize habit and calculate stats
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
    };

    const stats = calculateHabitStats(serializedHabit);

    return NextResponse.json({
      success: true,
      habit: serializedHabit,
      stats
    })
  } catch (error) {
    console.error('Error fetching habit:', error)
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error", 
      { status: 500 }
    )
  }
}