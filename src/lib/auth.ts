// src/lib/auth.ts

import { db } from "./db"
import { compare } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
export const runtime = 'nodejs'
const key = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function verifyAuth() {
  const token = cookies().get("auth-token")
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token.value, key)
    return payload.userId as string
  } catch {
    return null
  }
}

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) throw new Error("User not found")

  const isValid = await compare(password, user.password)
  if (!isValid) throw new Error("Invalid password")

  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(key)

  cookies().set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 86400
  })

  return user
}