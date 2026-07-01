import { prisma } from './prisma'

export interface DashboardGoal {
  id: string
  name: string
  emoji: string
  description: string | null
  targetPoints: number
  currentPoints: number
  availableTo: string
  isActive: boolean
  isCompleted: boolean
  completedAt: string | null
}

export interface CreateGoalInput {
  name: string
  emoji?: string
  description?: string
  targetPoints: number
  availableTo?: string
}

export interface UpdateGoalInput {
  name?: string
  emoji?: string
  description?: string
  targetPoints?: number
  availableTo?: string
}

function mapGoal(goal: {
  id: string
  name: string
  emoji: string
  description: string | null
  targetPoints: number
  currentPoints: number
  availableTo: string
  isActive: boolean
  isCompleted: boolean
  completedAt: Date | null
}): DashboardGoal {
  return {
    id: goal.id,
    name: goal.name,
    emoji: goal.emoji,
    description: goal.description,
    targetPoints: goal.targetPoints,
    currentPoints: goal.currentPoints,
    availableTo: goal.availableTo,
    isActive: goal.isActive,
    isCompleted: goal.isCompleted,
    completedAt: goal.completedAt?.toISOString() ?? null,
  }
}

export async function getDashboardGoals(): Promise<DashboardGoal[]> {
  const goals = await prisma.savingsGoal.findMany({
    where: { isActive: true },
    orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
  })
  return goals.map(mapGoal)
}

export async function createGoal(input: CreateGoalInput): Promise<DashboardGoal> {
  const goal = await prisma.savingsGoal.create({
    data: {
      name: input.name,
      emoji: input.emoji ?? '🎯',
      description: input.description,
      targetPoints: input.targetPoints,
      availableTo: input.availableTo ?? 'all',
    },
  })
  return mapGoal(goal)
}

export async function updateGoal(id: string, input: UpdateGoalInput): Promise<DashboardGoal> {
  const existing = await prisma.savingsGoal.findUnique({ where: { id } })
  if (!existing) throw new GoalError('NOT_FOUND', 'Doel niet gevonden')

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.emoji !== undefined && { emoji: input.emoji }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.targetPoints !== undefined && { targetPoints: input.targetPoints }),
      ...(input.availableTo !== undefined && { availableTo: input.availableTo }),
    },
  })
  return mapGoal(goal)
}

export async function deactivateGoal(id: string): Promise<void> {
  const existing = await prisma.savingsGoal.findUnique({ where: { id } })
  if (!existing) throw new GoalError('NOT_FOUND', 'Doel niet gevonden')
  await prisma.savingsGoal.update({ where: { id }, data: { isActive: false } })
}

export async function markGoalCompleted(id: string): Promise<DashboardGoal> {
  const existing = await prisma.savingsGoal.findUnique({ where: { id } })
  if (!existing) throw new GoalError('NOT_FOUND', 'Doel niet gevonden')

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: { isCompleted: true, completedAt: new Date() },
  })
  return mapGoal(goal)
}

export async function resetGoal(id: string): Promise<DashboardGoal> {
  const existing = await prisma.savingsGoal.findUnique({ where: { id } })
  if (!existing) throw new GoalError('NOT_FOUND', 'Doel niet gevonden')

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: {
      currentPoints: 0,
      isCompleted: false,
      completedAt: null,
    },
  })
  return mapGoal(goal)
}

export class GoalError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'INSUFFICIENT_POINTS' | 'NOT_AVAILABLE' | 'ALREADY_COMPLETED' | 'INVALID_AMOUNT',
    message: string
  ) {
    super(message)
    this.name = 'GoalError'
  }
}
