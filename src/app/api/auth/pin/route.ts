import { NextResponse } from 'next/server'
import { verifyParentPin } from '@/lib/auth'
import { createSessionToken, sessionCookieOptions } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()

    if (!pin) {
      return NextResponse.json({ error: 'Pincode is verplicht' }, { status: 400 })
    }

    const valid = await verifyParentPin(String(pin))
    if (!valid) {
      return NextResponse.json({ error: 'Onjuiste pincode', code: 'INVALID_PIN' }, { status: 401 })
    }

    const token = createSessionToken()
    const response = NextResponse.json({ ok: true })
    response.cookies.set(sessionCookieOptions(token))
    return response
  } catch (error) {
    console.error('Pin auth failed:', error)
    return NextResponse.json({ error: 'Authenticatie mislukt' }, { status: 500 })
  }
}
