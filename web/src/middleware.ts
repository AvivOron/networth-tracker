import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token')?.value

  // If no token, redirect to signin
  if (!token) {
    const signInUrl = new URL('/', request.url)
    signInUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Try to verify the token
  try {
    await jwtVerify(token, secret)
    // Token is valid, continue
    return NextResponse.next()
  } catch (error) {
    // Token is invalid, redirect to signin
    const signInUrl = new URL('/', request.url)
    signInUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signInUrl)
  }
}

export const config = {
  matcher: ['/finance-hub/app/:path*', '/finance-hub/api/data/:path*']
}
