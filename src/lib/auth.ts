// src/lib/auth.ts
import { db } from "./db"
import { compare } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

export const runtime = 'nodejs'

const getKey = () => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_123456789'
  return new TextEncoder().encode(secret)
}

const key = getKey()

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

  const isValid = await compare(password, user.password)
  if (!isValid) {
    console.log('Invalid password for:', email)
    throw new Error("Invalid password")
  }

  const token = await new SignJWT({ 
    userId: user.id,
    email: user.email 
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)

  cookies().set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: '/'
  })

  return {
    id: user.id,
    email: user.email
  }
}

export async function logout() {
  cookies().delete("auth-token")
  return { success: true }
}