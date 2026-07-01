import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { DashboardError, giveBonusTask } from '@/lib/dashboard'

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const { childId, taskId } = await request.json()

    if (!childId || !taskId) {
      return NextResponse.json({ error: 'childId en taskId zijn verplicht' }, { status: 400 })
    }

    await giveBonusTask(childId, taskId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof DashboardError) {
      const status = error.code === 'NOT_FOUND' ? 404 : 409
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error('Bonus assign failed:', error)
    return NextResponse.json({ error: 'Kon bonustaak niet geven' }, { status: 500 })
  }
}
