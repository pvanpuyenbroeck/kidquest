import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import {
  deactivateGoal,
  GoalError,
  markGoalCompleted,
  resetGoal,
  updateGoal,
} from '@/lib/goals'

interface RouteParams {
  params: { id: string }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { action, name, emoji, description, targetPoints, availableTo } = body

    if (action === 'complete') {
      const goal = await markGoalCompleted(params.id)
      return NextResponse.json(goal)
    }

    if (action === 'reset') {
      const goal = await resetGoal(params.id)
      return NextResponse.json(goal)
    }

    const goal = await updateGoal(params.id, {
      name,
      emoji,
      description,
      targetPoints: targetPoints !== undefined ? Number(targetPoints) : undefined,
      availableTo,
    })

    return NextResponse.json(goal)
  } catch (error) {
    if (error instanceof GoalError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Dashboard goals PATCH failed:', error)
    return NextResponse.json({ error: 'Kon doel niet bijwerken' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    await deactivateGoal(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof GoalError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Dashboard goals DELETE failed:', error)
    return NextResponse.json({ error: 'Kon doel niet verwijderen' }, { status: 500 })
  }
}
