// src/app/api/auth/signup/route.ts
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const hashedPassword = await hash(password, 12)
    
    const user = await db.user.create({
      data: { 
        email,
        password: hashedPassword,
      }
    })

    return NextResponse.json({
      user: { id: user.id, email: user.email }
    })
  } catch (error) {
    return new NextResponse("Error", { status: 500 })
  }
}