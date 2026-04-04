import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { saveAppData } from '@/lib/data'
import { generateMockData } from '@/lib/tour-data'
import { DEMO_USER_EMAIL } from '@/lib/auth'

export default async function TourStartPage() {
  const cookieStore = await cookies()

  try {
    console.log('[Tour] Starting tour setup...')
    // Create or get the demo user
    console.log('[Tour] Finding or creating demo user:', DEMO_USER_EMAIL)
    let user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL }
    })

    if (!user) {
      console.log('[Tour] Creating new demo user')
      user = await prisma.user.create({
        data: {
          email: DEMO_USER_EMAIL,
          name: 'Tour Demo'
        }
      })
    }
    console.log('[Tour] Using user ID:', user.id)

    // Create or update normalized tables with mock data
    console.log('[Tour] Generating mock data...')
    console.log('[Tour] Saving user data...')
    await saveAppData(user.id, generateMockData() as any)
    console.log('[Tour] User data saved')

    // Create a session token
    console.log('[Tour] Creating session...')
    const sessionToken = `tour-${Date.now()}-${Math.random().toString(36).substring(2)}`
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    })
    console.log('[Tour] Session created:', sessionToken)

    // Set session cookie
    cookieStore.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60
    })

    // Redirect to app
    console.log('[Tour] Redirecting to app...')
    redirect('/app')
  } catch (error) {
    console.error('[Tour] ERROR:', error)
    if (error instanceof Error) {
      console.error('[Tour] Error message:', error.message)
      console.error('[Tour] Stack:', error.stack)
    }
    redirect('/auth/error')
  }
}
