
// src/app/api/habits/[habitId]/entries/route.ts
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const habit = await prisma.habit.findUnique({
      where: {
        id: params.habitId,
        userId: user.id
      }
    })

    if (!habit) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const body = await req.json()
    const { date, completed } = body

    const entry = await prisma.habitEntry.upsert({
      where: {
        habitId_date: {
          habitId: params.habitId,
          date: new Date(date)
        }
      },
      update: {
        completed
      },
      create: {
        habitId: params.habitId,
        date: new Date(date),
        completed
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}