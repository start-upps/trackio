// src/lib/actions.ts
"use server"

import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createHabit(formData: FormData) {
  const userId = await verifyAuth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const color = formData.get("color") as string || "#E040FB"
  const icon = formData.get("icon") as string || "📝"

  await db.habit.create({
    data: {
      name,
      description,
      color,
      icon,
      userId
    },
  })

  revalidatePath("/")
}

export async function toggleHabit(habitId: string, date: string) {
  const userId = await verifyAuth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const habit = await db.habit.findUnique({
    where: {
      id: habitId,
      userId,
    },
  })

  if (!habit) {
    throw new Error("Habit not found")
  }

  const entry = await db.habitEntry.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: new Date(date),
      },
    },
  })

  if (entry) {
    await db.habitEntry.delete({
      where: {
        id: entry.id,
      },
    })
  } else {
    await db.habitEntry.create({
      data: {
        habitId,
        date: new Date(date),
        completed: true,
      },
    })
  }

  revalidatePath("/")
}