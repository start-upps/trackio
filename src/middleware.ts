// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const publicRoutes = ['/auth/login', '/auth/signup']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log('Middleware checking path:', path)

  if (publicRoutes.includes(path)) {
    console.log('Public route detected, allowing access')
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')
  console.log('Auth token:', token ? 'present' : 'missing')
  
  if (!token) {
    console.log('No token found, redirecting to login')
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET || '')
    )

    if (!payload.userId) {
      console.log('Invalid token payload, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    console.log('Valid token found for user:', payload.userId)
    return NextResponse.next()
  } catch (error) {
    console.log('Token verification failed:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}