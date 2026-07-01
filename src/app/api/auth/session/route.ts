import { NextResponse } from 'next/server'
import { isParentAuthenticated } from '@/lib/session'

export async function GET() {
  const authenticated = await isParentAuthenticated()
  return NextResponse.json({ authenticated })
}
