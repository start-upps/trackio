// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server"
import { login } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const user = await login(email, password)
    return NextResponse.json({ user })
  } catch (error) {
    return new NextResponse("Auth failed", { status: 401 })
  }
}