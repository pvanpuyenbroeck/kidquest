import type { Metadata } from 'next'
import { getFamilyScreenData } from '@/lib/db'
import { FamilyScreen } from '@/components/shared/FamilyScreen'

export const metadata: Metadata = {
  title: 'Gezinsscherm — KidQuest',
}

export const dynamic = 'force-dynamic'

export default async function FamilyPage() {
  const data = await getFamilyScreenData()
  return <FamilyScreen data={data} />
}
