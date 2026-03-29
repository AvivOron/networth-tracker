import { NextResponse } from 'next/server'
import { encode } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { generateMockData } from '@/lib/tour-data'
import { DEMO_USER_EMAIL } from '@/lib/auth'

export async function GET(request: Request) {
  console.log('[Tour API] GET request received')

  try {
    console.log('[Tour API] Finding or creating demo user:', DEMO_USER_EMAIL)

    // Create or get the demo user
    let user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL }
    })

    if (!user) {
      console.log('[Tour API] Creating new demo user')
      user = await prisma.user.create({
        data: {
          email: DEMO_USER_EMAIL,
          name: 'Tour Demo'
        }
      })
    }
    console.log('[Tour API] User ID:', user.id)

    // Create or update userData with mock data
    console.log('[Tour API] Generating and saving mock data')
    const mockData = generateMockData() as any
    await prisma.userData.upsert({
      where: { userId: user.id },
      update: { data: mockData },
      create: {
        userId: user.id,
        data: mockData
      }
    })

    // Create a JWT token
    console.log('[Tour API] Creating JWT token')
    const token = await encode({
      token: {
        sub: user.id,
        email: user.email,
        name: user.name,
        id: user.id,
        isDemo: true
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 24 * 60 * 60 // 24 hours
    })

    console.log('[Tour API] Token created, redirecting...')

    // Create redirect response
    const response = NextResponse.redirect(new URL('/finance-hub/app', request.url))

    // Set JWT cookie
    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    })

    console.log('[Tour API] Success!')
    return response
  } catch (error) {
    console.error('[Tour API] ERROR:', error)
    if (error instanceof Error) {
      console.error('[Tour API] Message:', error.message)
      console.error('[Tour API] Stack:', error.stack)
    }
    return NextResponse.redirect(new URL('/finance-hub/auth/error', request.url))
  }
}
