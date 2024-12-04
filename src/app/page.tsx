// src/app/page.tsx
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfMonth, subMonths } from "date-fns";
import ClientPage from "@/components/ClientPage";
import type { Prisma } from "@prisma/client";

export const metadata = {
  title: "Habit Tracker - Dashboard",
  description: "Track your daily habits",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHabits(userId: string) {
  try {
    const startDate = startOfMonth(subMonths(new Date(), 6));

    const habits = await db.habit.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      include: {
        entries: {
          where: { 
            date: { 
              gte: startDate 
            } 
          },
          orderBy: { 
            date: 'desc' 
          },
        },
      },
      orderBy: { 
        createdAt: 'desc' 
      },
    });

    return habits.map(habit => ({
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
      deletedAt: habit.deletedAt?.toISOString(),
      entries: habit.entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
    }));
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

  try {
    const habits = await getHabits(userId);
    return <ClientPage habits={habits} />;
  } catch (error) {
    return (
      <ClientPage 
        habits={[]}
        error={error instanceof Error ? error : new Error('An unexpected error occurred')}
      />
    );
  }
}