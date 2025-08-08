import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // If user is authenticated and trying to access auth pages, redirect to home
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/create-post/:path*',
    '/create-community/:path*',
    '/settings/:path*',
    '/login',
    '/register',
  ],
} 