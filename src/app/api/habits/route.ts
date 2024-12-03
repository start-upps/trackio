// src/app/api/habits/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { startOfMonth, subMonths } from "date-fns"
import { calculateHabitStats } from "@/lib/stats"
import type { 
  Habit, 
  HabitEntry, 
  CreateHabitRequest, 
  ApiResponse,
  HabitsPaginatedResponse,
  HabitQueryParams,
  HabitStats
} from "@/types/habit"

export const runtime = 'nodejs'

type HabitWithEntries = Prisma.HabitGetPayload<{
  include: { entries: true }
}>

type SortableFields = 'name' | 'createdAt' | 'updatedAt'

function serializeHabit(habit: HabitWithEntries): Habit {
  return {
    ...habit,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
    deletedAt: habit.deletedAt?.toISOString() || undefined,
    entries: habit.entries.map((entry): HabitEntry => ({
      ...entry,
      date: entry.date.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }))
  }
}

function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json({
          success: false,
          error: {
            message: "A habit with this name already exists",
            code: error.code
          }
        }, { status: 409 })
      case 'P2025':
        return NextResponse.json({
          success: false,
          error: {
            message: "Habit not found",
            code: error.code
          }
        }, { status: 404 })
      default:
        return NextResponse.json({
          success: false,
          error: {
            message: "Database error",
            code: error.code,
            details: error.message
          }
        }, { status: 500 })
    }
  }
  
  if (error instanceof SyntaxError) {
    return NextResponse.json({
      success: false,
      error: {
        message: "Invalid request data",
        details: error.message
      }
    }, { status: 400 })
  }

  return NextResponse.json({
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Internal Server Error"
    }
  }, { status: 500 })
}

function parseQueryParams(searchParams: URLSearchParams): Required<HabitQueryParams> {
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10'))),
    showDeleted: searchParams.get('showDeleted') === 'true',
    startDate: searchParams.get('startDate') || startOfMonth(subMonths(new Date(), 6)).toISOString(),
    endDate: searchParams.get('endDate') || new Date().toISOString(),
    search: searchParams.get('search') || '',
    sortBy: (searchParams.get('sortBy') as SortableFields) || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  }
}

function buildWhereClause(userId: string, params: Required<HabitQueryParams>): Prisma.HabitWhereInput {
  const startDate = new Date(params.startDate)
  const endDate = new Date(params.endDate)

  return {
    userId,
    isDeleted: params.showDeleted ? undefined : false,
    entries: {
      some: {
        date: { 
          gte: startDate,
          lte: endDate
        }
      }
    },
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: params.search, mode: Prisma.QueryMode.insensitive } }
      ]
    })
  }
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse | HabitsPaginatedResponse>> {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: { message: "Unauthorized" }
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = parseQueryParams(searchParams)
    const where = buildWhereClause(userId, params)

    const [total, habits, activeCount, deletedCount] = await db.$transaction([
      db.habit.count({ where }),
      db.habit.findMany({
        where,
        include: {
          entries: {
            where: { 
              date: { 
                gte: new Date(params.startDate),
                lte: new Date(params.endDate)
              },
              completed: true
            },
            orderBy: { date: "desc" }
          },
        },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit
      }),
      db.habit.count({ where: { ...where, isDeleted: false } }),
      db.habit.count({ where: { ...where, isDeleted: true } })
    ])

    const serializedHabits = habits.map(habit => {
      const serialized = serializeHabit(habit)
      return {
        ...serialized,
        stats: calculateHabitStats(serialized)
      }
    })

    return NextResponse.json({
      success: true,
      data: serializedHabits,
      total,
      page: params.page,
      pageSize: params.limit,
      totalPages: Math.ceil(total / params.limit),
      activeHabits: activeCount,
      deletedHabits: deletedCount
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: { message: "Unauthorized" }
      }, { status: 401 })
    }

    const body = await req.json() as CreateHabitRequest
    
    const { 
      name, 
      description, 
      color = "#E040FB", 
      icon = "📝" 
    } = body

    if (!name?.trim() || !description?.trim()) {
      return NextResponse.json({
        success: false,
        error: { message: "Missing required fields" }
      }, { status: 400 })
    }

    // Check for duplicate habit names for this user
    const existingHabit = await db.habit.findFirst({
      where: {
        userId,
        name: name.trim(),
        isDeleted: false
      }
    })

    if (existingHabit) {
      return NextResponse.json({
        success: false,
        error: { message: "A habit with this name already exists" }
      }, { status: 409 })
    }

    const habit = await db.habit.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        color,
        icon,
        userId,
        isDeleted: false
      },
      include: {
        entries: true
      }
    })

    const serializedHabit = serializeHabit(habit)

    revalidatePath('/')

    return NextResponse.json({
      success: true,
      habit: serializedHabit
    })
  } catch (error) {
    return handleApiError(error)
  }
}