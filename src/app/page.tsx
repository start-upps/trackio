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
import { startOfMonth, subMonths } from "date-fns"

async function getHabitsWithStats(userId: string): Promise<FetchHabitResponse[]> {
  try {
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 6));

    const habits = await db.habit.findMany({
      where: { 
        userId,
        entries: {
          some: {
            date: {
              gte: sixMonthsAgo
            }
          }
        }
      },
      include: {
        entries: {
          where: {
            date: {
              gte: sixMonthsAgo
            }
          },
          orderBy: { date: "desc" },
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

      const stats = calculateHabitStats(serializedHabit);

      return {
        habit: serializedHabit,
        stats,
        monthlyStats: stats.monthlyStats // Add this line
      };
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw new Error('Failed to fetch habits and their statistics');
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
    console.error('Error in Home page:', e);
  }

  const activeHabits = habitsData.filter(data => !data.habit.archived);
  const archivedHabits = habitsData.filter(data => data.habit.archived);

  return (
    <main className="container mx-auto max-w-4xl p-4">
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
          <div className="space-y-8">
            {/* Active Habits */}
            <section>
              <HabitList 
                habits={activeHabits.map(data => data.habit)}
              />
            </section>

            {/* Archived Habits */}
            {archivedHabits.length > 0 && (
              <section className="pt-8 border-t border-gray-800">
                <h2 className="text-xl font-bold text-gray-400 mb-4">
                  Archived Habits
                </h2>
                <HabitList 
                  habits={archivedHabits.map(data => data.habit)}
                />
              </section>
            )}
          </div>
        )}
      </Suspense>
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