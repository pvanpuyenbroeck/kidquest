import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { createGoal, getDashboardGoals, GoalError } from '@/lib/goals'

export async function GET() {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const goals = await getDashboardGoals()
    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Dashboard goals GET failed:', error)
    return NextResponse.json({ error: 'Kon doelen niet laden' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { name, emoji, description, targetPoints, availableTo } = body

    if (!name || targetPoints === undefined) {
      return NextResponse.json(
        { error: 'Naam en streefbedrag zijn verplicht' },
        { status: 400 }
      )
    }

    const goal = await createGoal({
      name,
      emoji,
      description,
      targetPoints: Number(targetPoints),
      availableTo,
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    if (error instanceof GoalError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Dashboard goals POST failed:', error)
    return NextResponse.json({ error: 'Kon doel niet aanmaken' }, { status: 500 })
  }
}
