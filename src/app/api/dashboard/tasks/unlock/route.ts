import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { DashboardError, unlockAssignment } from '@/lib/dashboard'

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const { assignmentId } = await request.json()

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId is verplicht' }, { status: 400 })
    }

    await unlockAssignment(assignmentId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof DashboardError) {
      const status = error.code === 'NOT_FOUND' ? 404 : 409
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error('Task unlock failed:', error)
    return NextResponse.json({ error: 'Kon taak niet ontgrendelen' }, { status: 500 })
  }
}
