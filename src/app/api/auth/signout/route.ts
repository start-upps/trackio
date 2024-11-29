// src/app/api/auth/signout/route.ts
import { NextResponse } from "next/server"

export const runtime = 'nodejs'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("auth-token")
  return response
}