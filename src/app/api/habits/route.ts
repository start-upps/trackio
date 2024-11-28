// src/app/api/habits/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const habits = await db.habit.findMany({
      where: { userId },
      include: {
        entries: {
          orderBy: { date: "desc" },
          take: 28,
        },
      },
    })

    return NextResponse.json(habits)
  } catch {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
