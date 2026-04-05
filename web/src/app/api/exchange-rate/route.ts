import { NextResponse } from 'next/server'

const FALLBACK_USD_TO_NIS = 3.7
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

let cached: { rate: number; fetchedAt: number } | null = null

export async function GET() {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ rate: cached.rate, source: 'cache' })
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const rate: number = json?.rates?.ILS
    if (!rate || typeof rate !== 'number') throw new Error('ILS rate missing')
    cached = { rate, fetchedAt: Date.now() }
    return NextResponse.json({ rate, source: 'live' })
  } catch {
    return NextResponse.json({ rate: FALLBACK_USD_TO_NIS, source: 'fallback' })
  }
}
