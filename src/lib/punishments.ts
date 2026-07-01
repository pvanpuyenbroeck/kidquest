import { prisma } from './prisma'

export interface DashboardPunishment {
  id: string
  name: string
  emoji: string
  description: string | null
  pointsLoss: number
  isActive: boolean
}

export interface CreatePunishmentInput {
  name: string
  emoji?: string
  description?: string
  pointsLoss: number
}

export interface UpdatePunishmentInput {
  name?: string
  emoji?: string
  description?: string
  pointsLoss?: number
}

export interface GivePunishmentResult {
  childId: string
  childName: string
  punishmentName: string
  punishmentEmoji: string
  pointsLost: number
  newPoints: number
}

function mapPunishment(p: {
  id: string
  name: string
  emoji: string
  description: string | null
  pointsLoss: number
  isActive: boolean
}): DashboardPunishment {
  return {
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    description: p.description,
    pointsLoss: p.pointsLoss,
    isActive: p.isActive,
  }
}

export async function getDashboardPunishments(): Promise<DashboardPunishment[]> {
  const punishments = await prisma.punishment.findMany({
    where: { isActive: true },
    orderBy: { pointsLoss: 'asc' },
  })
  return punishments.map(mapPunishment)
}

export async function createPunishment(
  input: CreatePunishmentInput
): Promise<DashboardPunishment> {
  const punishment = await prisma.punishment.create({
    data: {
      name: input.name,
      emoji: input.emoji ?? '⚠️',
      description: input.description,
      pointsLoss: input.pointsLoss,
    },
  })
  return mapPunishment(punishment)
}

export async function updatePunishment(
  id: string,
  input: UpdatePunishmentInput
): Promise<DashboardPunishment> {
  const existing = await prisma.punishment.findUnique({ where: { id } })
  if (!existing) throw new PunishmentError('NOT_FOUND', 'Straf niet gevonden')

  const punishment = await prisma.punishment.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.emoji !== undefined && { emoji: input.emoji }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.pointsLoss !== undefined && { pointsLoss: input.pointsLoss }),
    },
  })
  return mapPunishment(punishment)
}

export async function deactivatePunishment(id: string): Promise<void> {
  const existing = await prisma.punishment.findUnique({ where: { id } })
  if (!existing) throw new PunishmentError('NOT_FOUND', 'Straf niet gevonden')
  await prisma.punishment.update({ where: { id }, data: { isActive: false } })
}

export async function givePunishment(
  childId: string,
  punishmentId: string,
  reason?: string
): Promise<GivePunishmentResult> {
  const [child, punishment] = await Promise.all([
    prisma.child.findUnique({ where: { id: childId } }),
    prisma.punishment.findUnique({ where: { id: punishmentId } }),
  ])

  if (!child || !punishment || !punishment.isActive) {
    throw new PunishmentError('NOT_FOUND', 'Straf niet gevonden')
  }

  const pointsLost = punishment.pointsLoss
  const newPoints = Math.max(0, child.points - pointsLost)
  const historyReason = reason?.trim()
    ? `Straf: ${punishment.name} — ${reason.trim()}`
    : `Straf: ${punishment.name}`

  await prisma.$transaction([
    prisma.child.update({
      where: { id: childId },
      data: { points: newPoints },
    }),
    prisma.childPunishment.create({
      data: {
        childId,
        punishmentId,
        reason: reason?.trim() || null,
      },
    }),
    prisma.pointHistory.create({
      data: {
        childId,
        delta: -pointsLost,
        reason: historyReason,
        sourceType: 'punishment',
        sourceId: punishmentId,
      },
    }),
  ])

  return {
    childId: child.id,
    childName: child.name,
    punishmentName: punishment.name,
    punishmentEmoji: punishment.emoji,
    pointsLost,
    newPoints,
  }
}

export class PunishmentError extends Error {
  constructor(
    public code: 'NOT_FOUND',
    message: string
  ) {
    super(message)
    this.name = 'PunishmentError'
  }
}
