// src/app/api/habits/[habitId]/entries/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { isSameDay } from "date-fns"

export async function POST(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await verifyAuth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const { date } = await req.json()
    const targetDate = new Date(date)
    const today = new Date()
    
    targetDate.setHours(12, 0, 0, 0)
    today.setHours(12, 0, 0, 0)

    if (!isSameDay(targetDate, today)) {
      return new NextResponse("Can only mark habits for today", { 
        status: 400,
        statusText: "Only today's habits can be marked"
      })
    }

    const habit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
        isDeleted: false,
      }
    })

    if (!habit) return new NextResponse("Habit not found", { status: 404 })

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
      await db.habitEntry.delete({
        where: { id: existingEntry.id }
      })
      entry = null
    } else {
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