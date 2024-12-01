// src/app/api/habits/[habitId]/entries/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { isBefore, startOfDay } from "date-fns"

export async function POST(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { date } = await req.json()
    const targetDate = new Date(date)
    const now = new Date()

    // Prevent marking future dates
    if (isBefore(startOfDay(now), startOfDay(targetDate))) {
      return new NextResponse("Cannot mark habits for future dates", { 
        status: 400,
        statusText: "Future dates are not allowed"
      })
    }

    // Verify habit belongs to user
    const habit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
      },
      include: {
        entries: {
          where: {
            date: targetDate
          }
        }
      }
    })

    if (!habit) {
      return new NextResponse("Habit not found", { status: 404 })
    }

    // Find existing entry for the date
    const existingEntry = await db.habitEntry.findUnique({
      where: {
        habitId_date: {
          habitId: params.habitId,
          date: targetDate,
        },
      },
    })

    let entry;

    if (existingEntry) {
      // If entry exists, delete it
      await db.habitEntry.delete({
        where: {
          id: existingEntry.id,
        },
      })
      entry = null;
    } else {
      // If no entry exists, create one
      entry = await db.habitEntry.create({
        data: {
          habitId: params.habitId,
          date: targetDate,
          completed: true,
        },
      })
    }

    revalidatePath('/')
    
    return NextResponse.json({ 
      success: true,
      entry,
      message: entry ? "Habit marked as complete" : "Habit completion removed"
    })
  } catch (error) {
    console.error('Error toggling habit entry:', error)
    
    if (error instanceof Error) {
      return new NextResponse(error.message, { 
        status: 500,
        statusText: "Failed to update habit"
      })
    }
    
    return new NextResponse("Internal Error", { 
      status: 500,
      statusText: "An unexpected error occurred"
    })
  }
}

// Response type
export interface ToggleHabitResponse {
  success: boolean;
  entry: HabitEntry | null;
  message: string;
}

export interface HabitEntry {
  id: string;
  date: Date;
  completed: boolean;
  habitId: string;
  createdAt: Date;
  updatedAt: Date;
}