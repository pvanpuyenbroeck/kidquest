import { NextResponse } from 'next/server'
import { getFamilyScreenData } from '@/lib/db'

export async function GET() {
  try {
    const data = await getFamilyScreenData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch family screen data:', error)
    return NextResponse.json({ error: 'Kon gegevens niet laden' }, { status: 500 })
  }
}
