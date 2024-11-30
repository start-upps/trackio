// src/app/api/habits/[habitId]/route.ts
// src/app/api/habits/[habitId]/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

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

    // First verify habit exists and belongs to user
    const existingHabit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
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
      ...(data.archived !== undefined && { archived: Boolean(data.archived) }),
    }

    const habit = await db.habit.update({
      where: {
        id: params.habitId,
        userId,
      },
      data: sanitizedData,
    })

    revalidatePath('/')
    return NextResponse.json({
      success: true,
      habit,
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

// Delete habit
export async function DELETE(
  _req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // First verify habit exists and belongs to user
    const habit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
      },
    })

    if (!habit) {
      return new NextResponse("Habit not found", { status: 404 })
    }

    // Use transaction to ensure all related data is deleted
    await db.$transaction([
      // First delete all associated entries
      db.habitEntry.deleteMany({
        where: {
          habitId: params.habitId,
        },
      }),
      // Then delete the habit itself
      db.habit.delete({
        where: {
          id: params.habitId,
          userId,
        },
      }),
    ])

    revalidatePath('/')
    return NextResponse.json({
      success: true,
      message: "Habit deleted successfully"
    })
  } catch (error) {
    console.error('Error deleting habit:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new NextResponse("Habit not found", { status: 404 })
      }
      if (error.code === 'P2003') {
        return new NextResponse("Cannot delete habit with existing entries", { status: 400 })
      }
    }
    
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

    const habit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
      },
      include: {
        entries: {
          orderBy: {
            date: 'desc'
          },
          take: 28,
        },
      },
    })

    if (!habit) {
      return new NextResponse("Habit not found", { status: 404 })
    }

    return NextResponse.json({
      success: true,
      habit
    })
  } catch (error) {
    console.error('Error fetching habit:', error)
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error", 
      { status: 500 }
    )
  }
}