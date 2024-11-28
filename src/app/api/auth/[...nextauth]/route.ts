// src/app/api/auth/[...nextauth]/route.ts
import { authOptions } from "@/lib/auth"
import NextAuth from "next-auth"

const handler = NextAuth(authOptions)

export const { GET, POST } = handler
export const runtime = "nodejs"