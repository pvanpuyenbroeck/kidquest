import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { contributeToGoal, GoalContributeError } from '@/lib/db'

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { childId, goalId, amount } = body

    if (!childId || !goalId || amount === undefined) {
      return NextResponse.json(
        { error: 'Kind, doel en aantal punten zijn verplicht' },
        { status: 400 }
      )
    }

    const result = await contributeToGoal(childId, goalId, Number(amount))
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof GoalContributeError) {
      const status =
        error.code === 'INSUFFICIENT_POINTS' || error.code === 'INVALID_AMOUNT'
          ? 400
          : error.code === 'NOT_FOUND'
            ? 404
            : 400
      return NextResponse.json({ error: error.message, code: error.code }, { status })
    }
    console.error('Goal contribute failed:', error)
    return NextResponse.json({ error: 'Kon punten niet storten' }, { status: 500 })
  }
}
