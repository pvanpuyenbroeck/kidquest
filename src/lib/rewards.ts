import { prisma } from './prisma'

export interface DashboardReward {
  id: string
  name: string
  emoji: string
  description: string | null
  pointsCost: number
  mediaUrl: string | null
  mediaType: string | null
  availableTo: string
  isActive: boolean
}

export interface CreateRewardInput {
  name: string
  emoji?: string
  description?: string
  pointsCost: number
  mediaUrl?: string
  mediaType?: string
  availableTo?: string
}

export interface UpdateRewardInput {
  name?: string
  emoji?: string
  description?: string
  pointsCost?: number
  mediaUrl?: string | null
  mediaType?: string | null
  availableTo?: string
}

export async function getDashboardRewards(): Promise<DashboardReward[]> {
  const rewards = await prisma.reward.findMany({
    where: { isActive: true },
    orderBy: { pointsCost: 'asc' },
  })

  return rewards.map((r) => ({
    id: r.id,
    name: r.name,
    emoji: r.emoji,
    description: r.description,
    pointsCost: r.pointsCost,
    mediaUrl: r.mediaUrl,
    mediaType: r.mediaType,
    availableTo: r.availableTo,
    isActive: r.isActive,
  }))
}

export async function createReward(input: CreateRewardInput): Promise<DashboardReward> {
  const reward = await prisma.reward.create({
    data: {
      name: input.name,
      emoji: input.emoji ?? '🎁',
      description: input.description,
      pointsCost: input.pointsCost,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      availableTo: input.availableTo ?? 'all',
    },
  })

  return {
    id: reward.id,
    name: reward.name,
    emoji: reward.emoji,
    description: reward.description,
    pointsCost: reward.pointsCost,
    mediaUrl: reward.mediaUrl,
    mediaType: reward.mediaType,
    availableTo: reward.availableTo,
    isActive: reward.isActive,
  }
}

export async function updateReward(
  id: string,
  input: UpdateRewardInput
): Promise<DashboardReward> {
  const existing = await prisma.reward.findUnique({ where: { id } })
  if (!existing) throw new RewardError('NOT_FOUND', 'Beloning niet gevonden')

  const reward = await prisma.reward.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.emoji !== undefined && { emoji: input.emoji }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.pointsCost !== undefined && { pointsCost: input.pointsCost }),
      ...(input.mediaUrl !== undefined && { mediaUrl: input.mediaUrl }),
      ...(input.mediaType !== undefined && { mediaType: input.mediaType }),
      ...(input.availableTo !== undefined && { availableTo: input.availableTo }),
    },
  })

  return {
    id: reward.id,
    name: reward.name,
    emoji: reward.emoji,
    description: reward.description,
    pointsCost: reward.pointsCost,
    mediaUrl: reward.mediaUrl,
    mediaType: reward.mediaType,
    availableTo: reward.availableTo,
    isActive: reward.isActive,
  }
}

export async function deactivateReward(id: string): Promise<void> {
  const existing = await prisma.reward.findUnique({ where: { id } })
  if (!existing) throw new RewardError('NOT_FOUND', 'Beloning niet gevonden')
  await prisma.reward.update({ where: { id }, data: { isActive: false } })
}

export class RewardError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'INSUFFICIENT_POINTS' | 'NOT_AVAILABLE',
    message: string
  ) {
    super(message)
    this.name = 'RewardError'
  }
}
