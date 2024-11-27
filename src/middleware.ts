// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
};

export function middleware(request: NextRequest) {
  const signInUrl = new URL("/auth/signin", request.url);
  return NextResponse.redirect(signInUrl);
}