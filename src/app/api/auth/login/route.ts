// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import { SignJWT } from "jose"

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    console.log('Login attempt for:', email)

    // Find user
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('User not found:', email)
      return new NextResponse("User not found", { status: 401 })
    }

    console.log('User found, verifying password')

    // Verify password
    const isValid = await compare(password, user.password)
    if (!isValid) {
      console.log('Invalid password for:', email)
      return new NextResponse("Invalid password", { status: 401 })
    }

    console.log('Password verified, creating token')

    // Create token
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET))

    console.log('Token created successfully')

    // Create response
    const response = NextResponse.json({ 
      user: { id: user.id, email: user.email } 
    })

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 
    })

    console.log('Login successful for:', email)
    return response

  } catch (error: any) {
    console.error('Login error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error?.message || 'Unknown error'
      }), 
      { status: 500 }
    )
  }
}