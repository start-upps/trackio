// src/app/actions.ts
"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleHabit(habitId: string, date: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const habit = await db.habit.findUnique({
    where: {
      id: habitId,
      userId: session.user.id,
    },
  });

  if (!habit) throw new Error("Habit not found");

  const entry = await db.habitEntry.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: new Date(date),
      },
    },
  });

  if (entry) {
    await db.habitEntry.delete({
      where: {
        id: entry.id,
      },
    });
  } else {
    await db.habitEntry.create({
      data: {
        habitId,
        date: new Date(date),
        completed: true,
      },
    });
  }

  revalidatePath("/");
}
