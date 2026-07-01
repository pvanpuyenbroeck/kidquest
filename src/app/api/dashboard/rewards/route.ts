import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { createReward, getDashboardRewards, RewardError } from '@/lib/rewards'

export async function GET() {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const rewards = await getDashboardRewards()
    return NextResponse.json({ rewards })
  } catch (error) {
    console.error('Dashboard rewards GET failed:', error)
    return NextResponse.json({ error: 'Kon beloningen niet laden' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { name, emoji, description, pointsCost, mediaUrl, mediaType, availableTo } = body

    if (!name || pointsCost === undefined) {
      return NextResponse.json(
        { error: 'Naam en puntenkosten zijn verplicht' },
        { status: 400 }
      )
    }

    const reward = await createReward({
      name,
      emoji,
      description,
      pointsCost: Number(pointsCost),
      mediaUrl,
      mediaType,
      availableTo,
    })

    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    if (error instanceof RewardError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Dashboard rewards POST failed:', error)
    return NextResponse.json({ error: 'Kon beloning niet aanmaken' }, { status: 500 })
  }
}
