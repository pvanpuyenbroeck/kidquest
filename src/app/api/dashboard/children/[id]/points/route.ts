import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { adjustChildPoints, DashboardError } from '@/lib/dashboard'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const { delta, reason } = await request.json()

    if (delta === undefined || !reason?.trim()) {
      return NextResponse.json(
        { error: 'Bedrag en reden zijn verplicht' },
        { status: 400 }
      )
    }

    const result = await adjustChildPoints(params.id, Number(delta), reason.trim())
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof DashboardError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('Points adjust failed:', error)
    return NextResponse.json({ error: 'Kon punten niet aanpassen' }, { status: 500 })
  }
}
