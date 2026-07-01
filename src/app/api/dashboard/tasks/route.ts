import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import {
  createTask,
  DashboardError,
  getDashboardTasks,
  getTodayAssignmentsOverview,
} from '@/lib/dashboard'

export async function GET() {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const [tasks, pending] = await Promise.all([
      getDashboardTasks(),
      getTodayAssignmentsOverview(),
    ])
    return NextResponse.json({ tasks, pending })
  } catch (error) {
    console.error('Dashboard tasks GET failed:', error)
    return NextResponse.json({ error: 'Kon taken niet laden' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const { name, emoji, type, points, childIds, mediaUrl, mediaType } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Naam en type zijn verplicht' }, { status: 400 })
    }

    const task = await createTask({
      name,
      emoji,
      type,
      points: Number(points) || 0,
      childIds,
      mediaUrl,
      mediaType,
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof DashboardError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Dashboard tasks POST failed:', error)
    return NextResponse.json({ error: 'Kon taak niet aanmaken' }, { status: 500 })
  }
}
