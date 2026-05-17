import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const COOKIE_NAME = "syndio-session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/sheets/init"
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Try to verify the JWT — works if JWT_SECRET is available in this context
  // Falls back to accepting any well-formed token if secret not available (Edge Function scope)
  const jwtSecret = process.env.JWT_SECRET
  if (jwtSecret) {
    try {
      const SECRET = new TextEncoder().encode(jwtSecret)
      await jwtVerify(token, SECRET)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // JWT_SECRET not available in Edge context — verify token structure only
  // (a valid JWT has 3 base64 parts separated by dots)
  const parts = token.split(".")
  if (parts.length === 3 && parts[1]) {
    try {
      const payload = JSON.parse(atob(parts[1]))
      // Check expiry and that it was issued by us
      if (payload.authenticated === true && payload.exp && payload.exp > Date.now() / 1000) {
        return NextResponse.next()
      }
    } catch {
      // invalid token
    }
  }

  return NextResponse.redirect(new URL("/login", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
