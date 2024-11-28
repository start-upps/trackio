// src/lib/auth.ts
import { db } from "./db"
import { compare } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

export const runtime = 'nodejs'

// Ensure JWT_SECRET exists
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables')
}

const key = new TextEncoder().encode(process.env.JWT_SECRET)

export async function verifyAuth() {
  console.log('Verifying authentication...')
  
  const token = cookies().get("auth-token")
  if (!token) {
    console.log('No token found')
    return null
  }

  try {
    console.log('Verifying token...')
    const { payload } = await jwtVerify(token.value, key)
    console.log('Token verified, user ID:', payload.userId)
    return payload.userId as string
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function login(email: string, password: string) {
  console.log('Login attempt for:', email)

  // Find user
  const user = await db.user.findUnique({ 
    where: { email },
    select: {
      id: true,
      email: true,
      password: true
    }
  })

  if (!user) {
    console.log('User not found:', email)
    throw new Error("User not found")
  }

  // Verify password
  const isValid = await compare(password, user.password)
  if (!isValid) {
    console.log('Invalid password for:', email)
    throw new Error("Invalid password")
  }

  console.log('Password verified, creating token')

  // Create token
  const token = await new SignJWT({ 
    userId: user.id,
    email: user.email 
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)

  // Set cookie
  cookies().set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Changed from "strict" to "lax" for better compatibility
    maxAge: 86400, // 24 hours
    path: '/' // Ensure cookie is available across the site
  })

  console.log('Login successful for:', email)

  // Return safe user data
  return {
    id: user.id,
    email: user.email
  }
}

export async function logout() {
  cookies().delete("auth-token")
  return { success: true }
}