import { prisma } from './prisma'

export async function verifyParentPin(pin: string): Promise<boolean> {
  const settings = await prisma.settings.findFirst()
  // DB-pincode (instelbaar via dashboard) is leidend; env dient als fallback.
  const expected = settings?.parentPin ?? process.env.PARENT_PIN ?? '1234'
  return pin === expected
}
