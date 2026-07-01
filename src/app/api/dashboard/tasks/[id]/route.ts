import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { DashboardError, deactivateTask, updateTask } from '@/lib/dashboard'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const task = await updateTask(params.id, {
      name: body.name,
      emoji: body.emoji,
      type: body.type,
      points: body.points !== undefined ? Number(body.points) : undefined,
      childIds: body.childIds,
      mediaUrl: body.mediaUrl,
      mediaType: body.mediaType,
    })
    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof DashboardError) {
      const status = error.code === 'NOT_FOUND' ? 404 : 400
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error('Dashboard task PATCH failed:', error)
    return NextResponse.json({ error: 'Kon taak niet bijwerken' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    await deactivateTask(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof DashboardError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Dashboard task DELETE failed:', error)
    return NextResponse.json({ error: 'Kon taak niet verwijderen' }, { status: 500 })
  }
}
