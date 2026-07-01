import { NextResponse } from 'next/server'
import { requireParentSession } from '@/lib/api-auth'
import { getSettings, SettingsError, updateSettings } from '@/lib/settings'

export async function GET() {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const settings = await getSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Dashboard settings GET failed:', error)
    return NextResponse.json({ error: 'Kon instellingen niet laden' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const auth = await requireParentSession()
  if (!auth.authenticated) return auth.response

  try {
    const body = await request.json()
    const settings = await updateSettings({
      familyName: body.familyName,
      dayCloseHour:
        body.dayCloseHour !== undefined ? Number(body.dayCloseHour) : undefined,
      dailyStartPoints:
        body.dailyStartPoints !== undefined ? Number(body.dailyStartPoints) : undefined,
      newPin: body.newPin !== undefined ? String(body.newPin) : undefined,
    })
    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof SettingsError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 })
    }
    console.error('Dashboard settings PATCH failed:', error)
    return NextResponse.json({ error: 'Kon instellingen niet opslaan' }, { status: 500 })
  }
}
