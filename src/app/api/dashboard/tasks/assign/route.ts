import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { DashboardError, toggleTaskAssignment } from '@/lib/dashboard'

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const { childId, taskId, assigned } = await request.json()

    if (!childId || !taskId || assigned === undefined) {
      return NextResponse.json({ error: 'Ontbrekende velden' }, { status: 400 })
    }

    await toggleTaskAssignment(childId, taskId, Boolean(assigned))
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof DashboardError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Task assign failed:', error)
    return NextResponse.json({ error: 'Kon toewijzing niet wijzigen' }, { status: 500 })
  }
}
