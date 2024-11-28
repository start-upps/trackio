// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export const GET = handler.auth
export const POST = handler.auth
export const runtime = "nodejs"