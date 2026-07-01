import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { claimReward, RewardClaimError } from '@/lib/db'

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: 'Voer eerst de ouder-pincode in', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  try {
    const { childId, rewardId } = await request.json()

    if (!childId || !rewardId) {
      return NextResponse.json(
        { error: 'childId en rewardId zijn verplicht' },
        { status: 400 }
      )
    }

    const result = await claimReward(childId, rewardId)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof RewardClaimError) {
      const status =
        error.code === 'INSUFFICIENT_POINTS'
          ? 402
          : error.code === 'ALREADY_CLAIMED_TODAY'
            ? 409
          : error.code === 'NOT_AVAILABLE'
            ? 403
            : error.code === 'NOT_FOUND'
              ? 404
              : 401
      return NextResponse.json({ error: error.message, code: error.code }, { status })
    }

    console.error('Reward claim failed:', error)
    return NextResponse.json({ error: 'Kon beloning niet claimen' }, { status: 500 })
  }
}
