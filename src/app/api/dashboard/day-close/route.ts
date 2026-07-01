import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { processMissedAssignments } from '@/lib/day-close'

export async function POST() {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const result = await processMissedAssignments({ forceToday: true })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Day close failed:', error)
    return NextResponse.json({ error: 'Kon dag niet afsluiten' }, { status: 500 })
  }
}
