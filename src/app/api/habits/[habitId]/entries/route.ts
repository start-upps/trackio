// src/app/api/habits/[habitId]/entries/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { habitId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const habit = await db.habit.findUnique({
      where: {
        id: params.habitId,
        userId: session.user.id,
      },
    });

    if (!habit) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const { date, completed } = await req.json();

    const entry = await db.habitEntry.upsert({
      where: {
        habitId_date: {
          habitId: params.habitId,
          date: new Date(date),
        },
      },
      update: {
        completed,
      },
      create: {
        habitId: params.habitId,
        date: new Date(date),
        completed,
      },
    });

    return NextResponse.json(entry);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export const runtime = "nodejs";
