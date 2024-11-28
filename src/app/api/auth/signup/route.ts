// src/app/api/auth/signup/route.ts

import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    console.log('Signup attempt for:', email)

    // Hash password
    const hashedPassword = await hash(password, 12)
    console.log('Password hashed successfully')

    // Create user
    const user = await db.user.create({
      data: { 
        email, 
        password: hashedPassword 
      }
    })
    console.log('User created successfully:', user.id)

    return NextResponse.json({
      user: { id: user.id, email: user.email }
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error?.message || 'Unknown error'
      }), 
      { status: 500 }
    )
  }
}