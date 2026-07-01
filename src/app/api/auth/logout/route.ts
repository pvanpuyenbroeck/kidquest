import { NextResponse } from 'next/server'
import { PARENT_SESSION_COOKIE } from '@/lib/session'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: PARENT_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
