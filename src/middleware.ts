// src/middleware.ts
import { auth } from "./lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth

  if (!isLoggedIn && !req.nextUrl.pathname.startsWith('/_next')) {
    return Response.redirect(new URL('/auth/signin', req.url))
  }

  return null
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

export const runtime = "nodejs"