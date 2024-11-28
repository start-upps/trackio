// src/app/page.tsx
import { redirect } from "next/navigation"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { HabitList } from "@/components/HabitList"
import { NewHabitButton } from "@/components/NewHabitButton"
import type { Habit } from "@/types/habit"

export default async function Home() {
  console.log('Home page - Verifying authentication')
  const userId = await verifyAuth()
  
  if (!userId) {
    console.log('Home page - No authenticated user, redirecting to login')
    redirect("/auth/login") // Changed from signin to login to match routes
  }

  console.log('Home page - User authenticated, fetching habits')

  try {
    const habits = await db.habit.findMany({
      where: { userId },
      include: {
        entries: {
          orderBy: { date: "desc" },
          take: 28,
        },
      },
    })

    console.log(`Home page - Found ${habits.length} habits`)

    const serializedHabits: Habit[] = habits.map(habit => ({
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
      entries: habit.entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
    }))

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
    )
  } catch (error) {
    console.error('Home page - Error fetching habits:', error)
    return (
      <main className="container mx-auto max-w-2xl p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-gray-400">Unable to load habits. Please try again later.</p>
        </div>
      </main>
    )
  }
}