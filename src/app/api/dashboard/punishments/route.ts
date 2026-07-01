import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import {
  createPunishment,
  getDashboardPunishments,
  PunishmentError,
} from '@/lib/punishments'

export async function GET() {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const punishments = await getDashboardPunishments()
    return NextResponse.json({ punishments })
  } catch (error) {
    console.error('Dashboard punishments GET failed:', error)
    return NextResponse.json({ error: 'Kon straffen niet laden' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { name, emoji, description, pointsLoss } = body

    if (!name || pointsLoss === undefined) {
      return NextResponse.json(
        { error: 'Naam en puntenverlies zijn verplicht' },
        { status: 400 }
      )
    }

    const punishment = await createPunishment({
      name,
      emoji,
      description,
      pointsLoss: Number(pointsLoss),
    })

    return NextResponse.json(punishment, { status: 201 })
  } catch (error) {
    if (error instanceof PunishmentError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Dashboard punishments POST failed:', error)
    return NextResponse.json({ error: 'Kon straf niet aanmaken' }, { status: 500 })
  }
}
