import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { deactivateChild, DashboardError, updateChild } from '@/lib/dashboard'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const child = await updateChild(params.id, {
      name: body.name,
      theme: body.theme,
      avatarEmoji: body.avatarEmoji,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
    })
    return NextResponse.json(child)
  } catch (error) {
    if (error instanceof DashboardError) {
      const status = error.code === 'NOT_FOUND' ? 404 : 400
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error('Dashboard child PATCH failed:', error)
    return NextResponse.json({ error: 'Kon kind niet bijwerken' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    await deactivateChild(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof DashboardError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Dashboard child DELETE failed:', error)
    return NextResponse.json({ error: 'Kon kind niet verwijderen' }, { status: 500 })
  }
}
