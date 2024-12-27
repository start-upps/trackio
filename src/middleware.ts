// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Define public paths that don't require authentication
const publicPaths = ['/auth/login', '/auth/signup', '/support']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log('Middleware checking path:', path)

  // Check if the current path is in publicPaths
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    console.log('Public path detected, allowing access:', path)
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
  // Update matcher to exclude public paths
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/* (auth routes)
     * - support (support page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|support).*)'
  ]
}