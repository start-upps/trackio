// src/app/api/habits/[habitId]/entries/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { isToday } from "date-fns"

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

    // Validate date is today
    if (!isToday(new Date(date))) {
      return new NextResponse("Can only track habits for today", { 
        status: 400,
        statusText: "Only today's habits can be tracked"
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
            date: new Date(date)
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
          date: new Date(date),
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
          date: new Date(date),
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
    
    // Provide more specific error messages
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

// Add a type to ensure proper response shape
interface ToggleHabitResponse {
  success: boolean;
  entry: HabitEntry | null;
  message: string;
}

interface HabitEntry {
  id: string;
  date: Date;
  completed: boolean;
  habitId: string;
  createdAt: Date;
  updatedAt: Date;
}