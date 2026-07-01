import { NextResponse } from 'next/server'
import { completeTaskAssignment, TaskCompleteError } from '@/lib/db'
import { isParentAuthenticated } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const authenticated = await isParentAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Voer eerst de ouder-pincode in', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { assignmentId } = body

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId is verplicht' }, { status: 400 })
    }

    const result = await completeTaskAssignment(assignmentId)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof TaskCompleteError) {
      const status =
        error.code === 'UNAUTHORIZED'
          ? 401
          : error.code === 'NOT_FOUND'
            ? 404
            : 409
      return NextResponse.json({ error: error.message, code: error.code }, { status })
    }

    console.error('Task complete failed:', error)
    return NextResponse.json({ error: 'Kon taak niet afvinken' }, { status: 500 })
  }
}
