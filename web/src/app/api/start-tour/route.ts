import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateMockData } from '@/lib/tour-data'
import { DEMO_USER_EMAIL } from '@/lib/auth'

export async function GET() {
  try {
    // Create or get the demo user
    let user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: DEMO_USER_EMAIL,
          name: 'Tour Demo'
        }
      })
    }

    // Create or update userData with mock data
    const mockData = generateMockData() as any
    await prisma.userData.upsert({
      where: { userId: user.id },
      update: { data: mockData },
      create: {
        userId: user.id,
        data: mockData
      }
    })

    // Create a session token
    const sessionToken = `tour-${Date.now()}-${Math.random().toString(36).substring(2)}`
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    })

    // Redirect with session cookie
    const baseUrl = process.env.NEXTAUTH_URL?.split('/finance-hub')[0] || 'http://localhost:3000'
    const response = NextResponse.redirect(new URL('/finance-hub/app', baseUrl))
    response.cookies.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60
    })

    return response
  } catch (error) {
    console.error('Tour start error:', error)
    const baseUrl = process.env.NEXTAUTH_URL?.split('/finance-hub')[0] || 'http://localhost:3000'
    return NextResponse.redirect(new URL('/finance-hub/auth/error', baseUrl))
  }
}
