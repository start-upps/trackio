// src/app/actions.ts
"use server"

import { db } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { isToday } from "date-fns"

export async function toggleHabit(habitId: string, date: string) {
  const userId = await verifyAuth()
  if (!userId) throw new Error("Unauthorized")

  // Validate that we're only tracking today's habits
  if (!isToday(new Date(date))) {
    throw new Error("Can only track habits for today")
  }

  const habit = await db.habit.findUnique({
    where: {
      id: habitId,
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

  if (!habit) throw new Error("Habit not found")

  // Check if habit is already completed today
  const entry = await db.habitEntry.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: new Date(date),
      },
    },
  });

  try {
    if (entry) {
      // Remove today's completion
      await db.habitEntry.delete({
        where: {
          id: entry.id,
        },
      });
    } else {
      // Mark today's habit as complete
      await db.habitEntry.create({
        data: {
          habitId,
          date: new Date(date),
          completed: true,
        },
      });
    }

    revalidatePath("/");
  } catch (error) {
    console.error('Error toggling habit:', error);
    throw new Error("Failed to update habit");
  }
}

// Helper function to get today's habit completion status
export async function getTodayHabitStatus(habitId: string) {
  const userId = await verifyAuth()
  if (!userId) throw new Error("Unauthorized")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const entry = await db.habitEntry.findFirst({
    where: {
      habitId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      habit: {
        userId
      }
    }
  })

  return {
    completed: !!entry?.completed,
    lastUpdated: entry?.updatedAt
  }
}