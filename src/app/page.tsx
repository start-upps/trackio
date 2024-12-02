// src/app/page.tsx
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { startOfMonth, subMonths } from "date-fns";
import { calculateHabitStats } from "@/lib/stats";
import ClientPage from "@/components/ClientPage";
import type { Habit, FetchHabitResponse } from "@/types/habit";

export const metadata: Metadata = {
  title: "Habit Tracker - Dashboard",
  description: "Track your daily habits",
};

// Disable caching to ensure fresh data
export const revalidate = 0;

async function getHabitsWithStats(userId: string): Promise<FetchHabitResponse[]> {
  try {
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 6));

    const habits = await db.habit.findMany({
      where: { 
        userId,
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
      orderBy: [
        { archived: 'asc' },  // Non-archived habits first
        { createdAt: 'desc' } // Most recent habits first
      ]
    });

    return habits.map(habit => {
      // Serialize dates to ISO strings
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

      // Calculate stats for the habit
      const stats = calculateHabitStats(serializedHabit);

      return {
        habit: serializedHabit,
        stats,
        monthlyStats: stats.monthlyStats
      };
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw new Error('Failed to fetch habits and their statistics');
  }
}

export default async function Page() {
  const userId = await verifyAuth();
  
  if (!userId) {
    redirect("/auth/login");
  }

  let habitsData: FetchHabitResponse[] = [];
  let error: Error | null = null;

  try {
    // Fetch habits with stats
    habitsData = await getHabitsWithStats(userId);
    
    // Log success for debugging
    console.log(`Successfully fetched ${habitsData.length} habits`);
  } catch (e) {
    error = e instanceof Error ? e : new Error('An unexpected error occurred');
    console.error('Error in Page:', e);
  }

  // Separate active and archived habits
  const activeHabits = habitsData
    .filter(data => !data.habit.archived)
    .sort((a, b) => new Date(b.habit.createdAt).getTime() - new Date(a.habit.createdAt).getTime());

  const archivedHabits = habitsData
    .filter(data => data.habit.archived)
    .sort((a, b) => new Date(b.habit.createdAt).getTime() - new Date(a.habit.createdAt).getTime());

  // Debug logging
  console.log(`Active habits: ${activeHabits.length}, Archived habits: ${archivedHabits.length}`);

  return (
    <ClientPage 
      activeHabits={activeHabits.map(data => ({
        ...data.habit,
        entries: data.habit.entries.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }))}
      archivedHabits={archivedHabits.map(data => ({
        ...data.habit,
        entries: data.habit.entries.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }))}
      error={error}
    />
  );
}