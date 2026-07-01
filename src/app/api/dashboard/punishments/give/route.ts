import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { givePunishment, PunishmentError } from '@/lib/punishments'

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { childId, punishmentId, reason } = body

    if (!childId || !punishmentId) {
      return NextResponse.json(
        { error: 'Kind en straf zijn verplicht' },
        { status: 400 }
      )
    }

    const result = await givePunishment(childId, punishmentId, reason)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof PunishmentError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Give punishment failed:', error)
    return NextResponse.json({ error: 'Kon straf niet geven' }, { status: 500 })
  }
}
