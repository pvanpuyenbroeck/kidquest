import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { createChild, DashboardError, getChildrenWithHistory } from '@/lib/dashboard'

export async function GET() {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const children = await getChildrenWithHistory()
    return NextResponse.json({ children })
  } catch (error) {
    console.error('Dashboard children GET failed:', error)
    return NextResponse.json({ error: 'Kon kinderen niet laden' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { name, theme, avatarEmoji } = body

    if (!name) {
      return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })
    }

    const child = await createChild({ name, theme, avatarEmoji })
    return NextResponse.json(child, { status: 201 })
  } catch (error) {
    if (error instanceof DashboardError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Dashboard children POST failed:', error)
    return NextResponse.json({ error: 'Kon kind niet aanmaken' }, { status: 500 })
  }
}
