import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { REFRESH_TOKEN_COOKIE_NAME } from "@/src/config/auth-edge"

function hasRefreshCookie(request: NextRequest): boolean {
  const value = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value
  return Boolean(value && value.length > 0)
}

function isPublicPage(pathname: string): boolean {
  if (pathname === "/") {
    return true
  }
  if (pathname === "/login" || pathname === "/register") {
    return true
  }
  if (pathname === "/products" || pathname.startsWith("/products/")) {
    return true
  }
  return false
}

function isPublicApi(pathname: string): boolean {
  if (pathname.startsWith("/api/public/")) {
    return true
  }
  if (pathname === "/api/auth" || pathname.startsWith("/api/auth/")) {
    return true
  }
  return false
}

function isProtectedUserPage(pathname: string): boolean {
  const roots = ["/account", "/orders", "/wishlist", "/checkout"] as const
  for (const root of roots) {
    if (pathname === root || pathname.startsWith(`${root}/`)) {
      return true
    }
  }
  return false
}

function isAdminPage(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/")
}

function isAdminApi(pathname: string): boolean {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/")
}

function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = "/login"
  url.searchParams.set("from", pathname)
  return NextResponse.redirect(url)
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const authenticated = hasRefreshCookie(request)

  if (isPublicPage(pathname)) {
    if (authenticated && (pathname === "/login" || pathname === "/register")) {
      const home = request.nextUrl.clone()
      home.pathname = "/"
      home.search = ""
      return NextResponse.redirect(home)
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    if (isPublicApi(pathname)) {
      return NextResponse.next()
    }
    if (isAdminApi(pathname)) {
      if (!authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      return NextResponse.next()
    }
    return NextResponse.next()
  }

  if (isAdminPage(pathname)) {
    if (!authenticated) {
      return redirectToLogin(request, pathname)
    }
    return NextResponse.next()
  }

  if (isProtectedUserPage(pathname)) {
    if (!authenticated) {
      return redirectToLogin(request, pathname)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Run on all paths except Next internals and common static assets.
     * Keeps middleware O(1) per request without scanning file extensions in code.
     */
    "/((?!_next/static|_next/image|robots.txt|sitemap.xml|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)",
  ],
}
