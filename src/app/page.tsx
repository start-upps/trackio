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

export const revalidate = 60;

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
  } catch (e) {
    error = e instanceof Error ? e : new Error('An unexpected error occurred');
    console.error('Error in Page:', e);
  }

  const activeHabits = habitsData.filter(data => !data.habit.archived);
  const archivedHabits = habitsData.filter(data => data.habit.archived);

  return (
    <ClientPage 
      activeHabits={activeHabits.map(data => data.habit)}
      archivedHabits={archivedHabits.map(data => data.habit)}
      error={error}
    />
  );
}