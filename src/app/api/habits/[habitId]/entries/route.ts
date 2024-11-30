// src/app/api/habits/[habitId]/entries/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

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

    // Verify habit belongs to user
    const habit = await db.habit.findFirst({
      where: {
        id: params.habitId,
        userId,
      },
    })

    if (!habit) {
      return new NextResponse("Habit not found", { status: 404 })
    }

    // Find existing entry
    const existingEntry = await db.habitEntry.findUnique({
      where: {
        habitId_date: {
          habitId: params.habitId,
          date: new Date(date),
        },
      },
    })

    if (existingEntry) {
      // If entry exists, delete it
      await db.habitEntry.delete({
        where: {
          id: existingEntry.id,
        },
      })
    } else {
      // If no entry exists, create one
      await db.habitEntry.create({
        data: {
          habitId: params.habitId,
          date: new Date(date),
          completed: true,
        },
      })
    }

    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error toggling habit entry:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
