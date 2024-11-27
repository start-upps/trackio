// src/app/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { HabitList } from "@/components/HabitList";
import { NewHabitButton } from "@/components/NewHabitButton";
import { type Habit } from "@/types/habit";
import { Habit as PrismaHabit, HabitEntry as PrismaHabitEntry } from "@prisma/client";

type HabitWithEntries = PrismaHabit & {
  entries: PrismaHabitEntry[];
};

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const habits = await db.habit.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      entries: {
        orderBy: {
          date: "desc",
        },
        take: 28,
      },
    },
  });

  const serializedHabits: Habit[] = habits.map((habit: HabitWithEntries) => ({
    ...habit,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
    entries: habit.entries.map((entry: PrismaHabitEntry) => ({
      ...entry,
      date: entry.date.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    })),
  }));

  return (
    <main className="container mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-gray-400">Track your daily habits</p>
        </div>
        <NewHabitButton />
      </div>
      <HabitList habits={serializedHabits} />
    </main>
  );
}