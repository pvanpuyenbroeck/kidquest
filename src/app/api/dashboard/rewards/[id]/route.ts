import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { deactivateReward, RewardError, updateReward } from '@/lib/rewards'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const reward = await updateReward(params.id, {
      name: body.name,
      emoji: body.emoji,
      description: body.description,
      pointsCost: body.pointsCost !== undefined ? Number(body.pointsCost) : undefined,
      mediaUrl: body.mediaUrl,
      mediaType: body.mediaType,
      availableTo: body.availableTo,
    })
    return NextResponse.json(reward)
  } catch (error) {
    if (error instanceof RewardError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Dashboard reward PATCH failed:', error)
    return NextResponse.json({ error: 'Kon beloning niet bijwerken' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    await deactivateReward(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof RewardError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Dashboard reward DELETE failed:', error)
    return NextResponse.json({ error: 'Kon beloning niet verwijderen' }, { status: 500 })
  }
}
