import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import {
  deactivatePunishment,
  PunishmentError,
  updatePunishment,
} from '@/lib/punishments'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const punishment = await updatePunishment(params.id, {
      name: body.name,
      emoji: body.emoji,
      description: body.description,
      pointsLoss: body.pointsLoss !== undefined ? Number(body.pointsLoss) : undefined,
    })
    return NextResponse.json(punishment)
  } catch (error) {
    if (error instanceof PunishmentError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Dashboard punishment PATCH failed:', error)
    return NextResponse.json({ error: 'Kon straf niet bijwerken' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    await deactivatePunishment(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof PunishmentError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Dashboard punishment DELETE failed:', error)
    return NextResponse.json({ error: 'Kon straf niet verwijderen' }, { status: 500 })
  }
}
