// src/app/page.tsx
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

export const revalidate = 0;

async function getHabitsWithStats(userId: string): Promise<FetchHabitResponse[]> {
  try {
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 6));

    const habits = await db.habit.findMany({
      where: { 
        userId,
        isDeleted: false,
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
      // Serialize dates to ISO strings
      const serializedHabit: Habit = {
        ...habit,
        createdAt: habit.createdAt.toISOString(),
        updatedAt: habit.updatedAt.toISOString(),
        deletedAt: habit.deletedAt?.toISOString() || undefined,
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
        success: true,
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
    habitsData = await getHabitsWithStats(userId);
    console.log(`Successfully fetched ${habitsData.length} habits`);
  } catch (e) {
    error = e instanceof Error ? e : new Error('An unexpected error occurred');
    console.error('Error in Page:', e);
  }

  // Sort habits by creation date and their entries by date
  const sortedHabits = habitsData
    .filter(data => data.success)
    .sort((a, b) => new Date(b.habit.createdAt).getTime() - new Date(a.habit.createdAt).getTime())
    .map(data => ({
      ...data.habit,
      entries: data.habit.entries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }));

  return (
    <ClientPage 
      habits={sortedHabits}
      error={error}
    />
  );
}