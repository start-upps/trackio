// src/app/api/habits/route.ts
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: user.id
      },
      include: {
        entries: {
          orderBy: {
            date: 'desc'
          },
          take: 28
        }
      }
    })

    return NextResponse.json(habits)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, description, color, icon } = body

    const habit = await prisma.habit.create({
      data: {
        name,
        description,
        color,
        icon,
        userId: user.id
      }
    })

    return NextResponse.json(habit)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
