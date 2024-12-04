// src/app/api/habits/[habitId]/entries/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { isBefore, startOfDay, isToday, format } from "date-fns"

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

    // Only allow marking habits for today
    if (!isToday(targetDate)) {
      return new NextResponse(
        isBefore(startOfDay(targetDate), startOfDay(now))
          ? "Cannot mark habits for past dates"
          : "Cannot mark habits for future dates", 
        { 
          status: 400,
          statusText: "Only today's habits can be marked"
        }
      )
    }

    // Verify habit belongs to user
    const habit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
        isDeleted: false, // Only allow marking non-deleted habits
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

    // Find existing entry for today
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
      // If entry exists, delete it (toggle off)
      await db.habitEntry.delete({
        where: {
          id: existingEntry.id,
        },
      })
      entry = null;
    } else {
      // If no entry exists, create one (toggle on)
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
      message: entry ? "Habit marked as complete" : "Habit completion removed",
      date: format(targetDate, 'yyyy-MM-dd')
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

// Response types with more detailed information
export interface ToggleHabitResponse {
  success: boolean;
  entry: HabitEntry | null;
  message: string;
  date: string;
}

export interface HabitEntry {
  id: string;
  date: Date;
  completed: boolean;
  habitId: string;
  createdAt: Date;
  updatedAt: Date;
}