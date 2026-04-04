import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEffectiveUserId } from '@/lib/household'
import { saveAccounts } from '@/lib/data'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const effectiveUserId = await getEffectiveUserId(session.user.id)
  const accounts = await request.json()
  await saveAccounts(effectiveUserId, accounts)
  return NextResponse.json({ success: true })
}
