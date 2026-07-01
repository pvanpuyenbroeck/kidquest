import { NextResponse } from 'next/server'
import { isParentAuthenticated } from './session'

export async function requireParentSession() {
  const authenticated = await isParentAuthenticated()
  if (!authenticated) {
    return {
      authenticated: false as const,
      response: NextResponse.json(
        { error: 'Niet ingelogd', code: 'UNAUTHORIZED' },
        { status: 401 }
      ),
    }
  }
  return { authenticated: true as const, response: null }
}
