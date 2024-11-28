// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import { SignJWT } from "jose"

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Find user
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return new NextResponse("Invalid credentials", { status: 401 })
    }

    // Verify password
    const isValid = await compare(password, user.password)
    if (!isValid) {
      return new NextResponse("Invalid credentials", { status: 401 })
    }

    // Create token
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET))

    // Create response
    const response = NextResponse.json({ 
      user: { id: user.id, email: user.email } 
    })

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}