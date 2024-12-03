// src/app/page.tsx
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { startOfMonth, subMonths } from "date-fns";
import { calculateHabitStats } from "@/lib/stats";
import type { 
  Habit, 
  HabitQueryParams,
  HabitsPaginatedResponse 
} from "@/types/habit";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Habit Tracker - Dashboard",
  description: "Track your daily habits",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type GetHabitsOptions = {
  userId: string;
} & Required<HabitQueryParams>;

type SearchParams = {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  showDeleted?: string;
  startDate?: string;
  endDate?: string;
};

type PageProps = {
  habits: Habit[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  stats?: {
    activeHabits: number;
    deletedHabits: number;
  };
  queryParams: Required<HabitQueryParams>;
  error?: Error | null;
};

async function getHabitsWithStats(options: GetHabitsOptions): Promise<HabitsPaginatedResponse> {
  try {
    const {
      userId,
      page,
      limit,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      showDeleted = false,
      startDate = startOfMonth(subMonths(new Date(), 6)).toISOString(),
    } = options;

    const where: Prisma.HabitWhereInput = {
      userId,
      isDeleted: showDeleted ? undefined : false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } }
        ]
      }),
      entries: {
        some: {
          date: {
            gte: new Date(startDate),
          }
        }
      }
    };

    const orderBy = { [sortBy]: sortOrder } as const;

    const [total, habits] = await Promise.all([
      db.habit.count({ where }),
      db.habit.findMany({
        where,
        include: {
          entries: {
            where: { date: { gte: new Date(startDate) } },
            orderBy: { date: 'desc' },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      })
    ]);

    const [activeCount, deletedCount] = await Promise.all([
      db.habit.count({ where: { ...where, isDeleted: false } }),
      db.habit.count({ where: { ...where, isDeleted: true } })
    ]);

    const serializedHabits = habits.map(habit => {
      const serializedHabit: Habit = {
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
      };

      const stats = calculateHabitStats(serializedHabit);

      return {
        ...serializedHabit,
        stats,
        monthlyStats: stats.monthlyStats
      };
    });

    return {
      success: true,
      data: serializedHabits,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      activeHabits: activeCount,
      deletedHabits: deletedCount
    };
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw new Error('Failed to fetch habits and their statistics');
  }
}

function HabitPage({ habits, pagination, stats, queryParams, error }: PageProps) {
  return (
    <div className="container mx-auto max-w-[1200px] p-4">
      {error ? (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-gray-400 mt-2">{error.message}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Habit Tracker</h1>
              <p className="text-gray-400">Track your daily habits</p>
            </div>
          </div>

          <div className="space-y-8">
            {habits.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-400 mb-4">
                  No habits tracked yet
                </h3>
                <p className="text-gray-500">
                  Create your first habit to start tracking your progress
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {habits.map(habit => (
                  <div
                    key={habit.id}
                    className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <h3 className="font-medium">{habit.name}</h3>
                    <p className="text-gray-400">{habit.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const userId = await verifyAuth();
  
  if (!userId) {
    redirect("/auth/login");
  }

  const queryParams = {
    page: Math.max(1, Number(searchParams.page) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.limit) || 10)),
    search: searchParams.search?.toString() || '',
    sortBy: (searchParams.sortBy as 'name' | 'createdAt' | 'updatedAt') || 'createdAt',
    sortOrder: (searchParams.sortOrder as 'asc' | 'desc') || 'desc',
    showDeleted: searchParams.showDeleted === 'true',
    startDate: searchParams.startDate?.toString() || startOfMonth(subMonths(new Date(), 6)).toISOString(),
    endDate: searchParams.endDate?.toString() || new Date().toISOString(),
  };

  try {
    const habitsData = await getHabitsWithStats({
      userId,
      ...queryParams
    });
    
    const props: PageProps = {
      habits: habitsData.data,
      pagination: {
        total: habitsData.total,
        page: habitsData.page,
        pageSize: habitsData.pageSize,
        totalPages: habitsData.totalPages,
      },
      stats: {
        activeHabits: habitsData.activeHabits,
        deletedHabits: habitsData.deletedHabits,
      },
      queryParams
    };

    return <HabitPage {...props} />;
  } catch (error) {
    return (
      <HabitPage 
        habits={[]}
        error={error instanceof Error ? error : new Error('An unexpected error occurred')}
        queryParams={queryParams}
      />
    );
  }
}
