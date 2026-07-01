import { prisma } from './prisma'

export interface DashboardSettings {
  familyName: string
  dayCloseHour: number
  dailyStartPoints: number
  hasCustomPin: boolean
}

export interface UpdateSettingsInput {
  familyName?: string
  dayCloseHour?: number
  dailyStartPoints?: number
  newPin?: string
}

const DEFAULT_PIN = '1234'

async function ensureSettings() {
  const existing = await prisma.settings.findFirst()
  if (existing) return existing
  return prisma.settings.create({
    data: { id: 1 },
  })
}

export async function getSettings(): Promise<DashboardSettings> {
  const settings = await ensureSettings()
  return {
    familyName: settings.familyName,
    dayCloseHour: settings.dayCloseHour,
    dailyStartPoints: settings.dailyStartPoints,
    hasCustomPin: settings.parentPin !== DEFAULT_PIN,
  }
}

export async function updateSettings(
  input: UpdateSettingsInput
): Promise<DashboardSettings> {
  const settings = await ensureSettings()

  if (input.dayCloseHour !== undefined) {
    if (
      !Number.isInteger(input.dayCloseHour) ||
      input.dayCloseHour < 0 ||
      input.dayCloseHour > 23
    ) {
      throw new SettingsError('INVALID_HOUR', 'Uur moet tussen 0 en 23 liggen')
    }
  }

  if (input.dailyStartPoints !== undefined) {
    if (
      !Number.isInteger(input.dailyStartPoints) ||
      input.dailyStartPoints < 0 ||
      input.dailyStartPoints > 999
    ) {
      throw new SettingsError(
        'INVALID_POINTS',
        'Startpunten moeten tussen 0 en 999 liggen'
      )
    }
  }

  if (input.newPin !== undefined) {
    if (!/^\d{4}$/.test(input.newPin)) {
      throw new SettingsError('INVALID_PIN', 'Pincode moet uit 4 cijfers bestaan')
    }
  }

  if (input.familyName !== undefined && !input.familyName.trim()) {
    throw new SettingsError('INVALID_NAME', 'Gezinsnaam mag niet leeg zijn')
  }

  const updated = await prisma.settings.update({
    where: { id: settings.id },
    data: {
      ...(input.familyName !== undefined && { familyName: input.familyName.trim() }),
      ...(input.dayCloseHour !== undefined && { dayCloseHour: input.dayCloseHour }),
      ...(input.dailyStartPoints !== undefined && {
        dailyStartPoints: input.dailyStartPoints,
      }),
      ...(input.newPin !== undefined && { parentPin: input.newPin }),
    },
  })

  return {
    familyName: updated.familyName,
    dayCloseHour: updated.dayCloseHour,
    dailyStartPoints: updated.dailyStartPoints,
    hasCustomPin: updated.parentPin !== DEFAULT_PIN,
  }
}

export class SettingsError extends Error {
  constructor(
    public code: 'INVALID_HOUR' | 'INVALID_PIN' | 'INVALID_NAME' | 'INVALID_POINTS',
    message: string
  ) {
    super(message)
    this.name = 'SettingsError'
  }
}
