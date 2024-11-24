// src/middleware.ts
import { auth } from "./lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')

  if (!isLoggedIn && !isAuthRoute && !req.nextUrl.pathname.startsWith('/_next')) {
    return Response.redirect(new URL('/auth/signin', req.url))
  }

  return null
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}