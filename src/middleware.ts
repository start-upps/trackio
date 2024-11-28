// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuth } from "@/lib/auth"

// List of public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/signup']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.includes(path)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')
  
  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    // Verify the token
    const verifiedToken = await verifyAuth()
    if (!verifiedToken) {
      throw new Error('Invalid token')
    }
    return NextResponse.next()
  } catch {
    // If token is invalid, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Don't run on public files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
