// src/app/page.tsx
import { redirect } from "next/navigation"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { HabitList } from "@/components/HabitList"
import type { Habit, FetchHabitResponse } from "@/types/habit"
import NewHabitButton from "@/components/NewHabitButton"
import { SignOutButton } from "@/components/SignOutButton"
import { calculateHabitStats } from "@/lib/stats"
import { Suspense } from "react"
import Loading from "./loading"

async function getHabitsWithStats(userId: string): Promise<FetchHabitResponse[]> {
  try {
    const habits = await db.habit.findMany({
      where: { userId },
      include: {
        entries: {
          orderBy: { date: "desc" },
          // Get full year of entries for better stats and heatmap
          take: 365,
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return habits.map(habit => {
      const serializedHabit: Habit = {
        ...habit,
        createdAt: habit.createdAt.toISOString(),
        updatedAt: habit.updatedAt.toISOString(),
        entries: habit.entries.map(entry => ({
          ...entry,
          date: entry.date.toISOString(),
          createdAt: entry.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString(),
        })),
      };

      return {
        habit: serializedHabit,
        stats: calculateHabitStats(serializedHabit)
      };
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw new Error('Failed to fetch habits');
  }
}

function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-red-500">Error</h1>
      <p className="text-gray-400 mt-2">{error.message}</p>
      <p className="text-gray-400 mt-1">Please try again later.</p>
      <SignOutButton className="mt-4" />
    </div>
  );
}

export default async function Home() {
  const userId = await verifyAuth();
  
  if (!userId) {
    redirect("/auth/login");
  }

  let habitsData: FetchHabitResponse[] = [];
  let error: Error | null = null;

  try {
    habitsData = await getHabitsWithStats(userId);
  } catch (e) {
    error = e instanceof Error ? e : new Error('An unexpected error occurred');
  }

  return (
    <main className="container mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-gray-400">Track your daily habits</p>
        </div>
        <div className="flex items-center space-x-4">
          <NewHabitButton />
          <SignOutButton />
        </div>
      </div>

      <Suspense fallback={<Loading />}>
      {error ? (
  <ErrorDisplay error={error} />
) : (
  <HabitList 
    habits={habitsData.map(data => data.habit)}
  />
)}
      </Suspense>

      {/* Toast Provider for notifications */}
      <div id="toast-container" className="fixed bottom-4 right-4 z-50" />
    </main>
  );
}

// Optimize page revalidation
export const revalidate = 60; // Revalidate every minute

// Generate metadata
export const metadata = {
  title: 'Habit Tracker - Dashboard',
  description: 'Track and manage your daily habits',
};