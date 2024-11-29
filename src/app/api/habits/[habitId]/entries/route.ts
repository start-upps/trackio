// src/app/api/habits/[habitId]/entries/route.ts
import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function PATCH(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name, description, color, icon, archived } = await req.json()

    const habit = await db.habit.update({
      where: {
        id: params.habitId,
        userId,
      },
      data: {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(color && { color }),
        ...(icon && { icon }),
        ...(archived !== undefined && { archived }),
      },
    })

    revalidatePath('/')
    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error updating habit:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await verifyAuth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await db.habit.delete({
      where: {
        id: params.habitId,
        userId,
      },
    })

    revalidatePath('/')
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}