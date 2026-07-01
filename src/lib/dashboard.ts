import { getOrCreateTodayAssignments } from './db'
import { prisma } from './prisma'

export type TaskType = 'daily' | 'weekly' | 'bonus'

export interface DashboardTask {
  id: string
  name: string
  emoji: string
  type: TaskType
  recurrence: string | null
  pointsReward: number
  pointsLoss: number
  mediaUrl: string | null
  mediaType: string | null
  isActive: boolean
  assignedChildIds: string[]
}

export interface PendingAssignment {
  id: string
  status: string
  childId: string
  childName: string
  task: { id: string; name: string; emoji: string; type: string }
}

export interface ChildWithHistory {
  id: string
  name: string
  theme: string
  avatarEmoji: string
  points: number
  history: {
    id: string
    delta: number
    reason: string
    sourceType: string
    createdAt: string
  }[]
}

export interface CreateTaskInput {
  name: string
  emoji?: string
  type: TaskType
  points: number
  childIds?: string[]
  mediaUrl?: string
  mediaType?: string
}

export interface UpdateTaskInput {
  name?: string
  emoji?: string
  type?: TaskType
  points?: number
  childIds?: string[]
  mediaUrl?: string | null
  mediaType?: string | null
}

function recurrenceForType(type: TaskType): string | null {
  if (type === 'daily') return 'daily'
  if (type === 'weekly') return 'weekly'
  return null
}

function pointsFieldsForType(type: TaskType, points: number) {
  if (type === 'bonus') {
    return { pointsReward: points, pointsLoss: 0 }
  }
  return { pointsReward: 0, pointsLoss: points }
}

export async function getDashboardTasks(): Promise<DashboardTask[]> {
  const tasks = await prisma.task.findMany({
    where: { isActive: true },
    include: { childTasks: { select: { childId: true } } },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  })

  return tasks.map((task) => ({
    id: task.id,
    name: task.name,
    emoji: task.emoji,
    type: task.type as TaskType,
    recurrence: task.recurrence,
    pointsReward: task.pointsReward,
    pointsLoss: task.pointsLoss,
    mediaUrl: task.mediaUrl,
    mediaType: task.mediaType,
    isActive: task.isActive,
    assignedChildIds: task.childTasks.map((ct) => ct.childId),
  }))
}

export async function getTodayAssignmentsOverview(): Promise<PendingAssignment[]> {
  const children = await prisma.child.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  const pending: PendingAssignment[] = []

  for (const child of children) {
    const assignments = await getOrCreateTodayAssignments(child.id)
    for (const a of assignments) {
      if (a.status === 'pending') {
        pending.push({
          id: a.id,
          status: a.status,
          childId: child.id,
          childName: child.name,
          task: a.task,
        })
      }
    }
  }

  return pending
}

export async function createTask(input: CreateTaskInput): Promise<DashboardTask> {
  const { name, emoji = '✅', type, points, childIds = [], mediaUrl, mediaType } = input
  const recurrence = recurrenceForType(type)
  const pointsFields = pointsFieldsForType(type, points)

  const task = await prisma.task.create({
    data: {
      name,
      emoji,
      type,
      recurrence,
      ...pointsFields,
      mediaUrl: type === 'bonus' ? mediaUrl || null : null,
      mediaType: type === 'bonus' ? mediaType || null : null,
      childTasks: {
        create: childIds.map((childId) => ({ childId })),
      },
    },
    include: { childTasks: { select: { childId: true } } },
  })

  return {
    id: task.id,
    name: task.name,
    emoji: task.emoji,
    type: task.type as TaskType,
    recurrence: task.recurrence,
    pointsReward: task.pointsReward,
    pointsLoss: task.pointsLoss,
    mediaUrl: task.mediaUrl,
    mediaType: task.mediaType,
    isActive: task.isActive,
    assignedChildIds: task.childTasks.map((ct) => ct.childId),
  }
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<DashboardTask> {
  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) throw new DashboardError('NOT_FOUND', 'Taak niet gevonden')

  const type = (input.type ?? existing.type) as TaskType
  const points =
    input.points ??
    (type === 'bonus' ? existing.pointsReward : existing.pointsLoss)

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.emoji !== undefined && { emoji: input.emoji }),
      ...(input.type !== undefined && {
        type: input.type,
        recurrence: recurrenceForType(input.type),
        ...pointsFieldsForType(input.type, points),
      }),
      ...(input.points !== undefined &&
        input.type === undefined && {
          ...pointsFieldsForType(type, points),
        }),
      ...(input.mediaUrl !== undefined && { mediaUrl: input.mediaUrl }),
      ...(input.mediaType !== undefined && { mediaType: input.mediaType }),
    },
    include: { childTasks: { select: { childId: true } } },
  })

  if (input.childIds !== undefined) {
    const currentIds = task.childTasks.map((ct) => ct.childId)
    const toAdd = input.childIds.filter((id) => !currentIds.includes(id))
    const toRemove = currentIds.filter((id) => !input.childIds!.includes(id))

    await Promise.all([
      ...toAdd.map((childId) =>
        prisma.childTask.create({ data: { childId, taskId: id } })
      ),
      ...toRemove.map((childId) =>
        prisma.childTask.deleteMany({ where: { childId, taskId: id } })
      ),
    ])
  }

  const updated = await prisma.task.findUniqueOrThrow({
    where: { id },
    include: { childTasks: { select: { childId: true } } },
  })

  return {
    id: updated.id,
    name: updated.name,
    emoji: updated.emoji,
    type: updated.type as TaskType,
    recurrence: updated.recurrence,
    pointsReward: updated.pointsReward,
    pointsLoss: updated.pointsLoss,
    mediaUrl: updated.mediaUrl,
    mediaType: updated.mediaType,
    isActive: updated.isActive,
    assignedChildIds: updated.childTasks.map((ct) => ct.childId),
  }
}

export async function deactivateTask(id: string): Promise<void> {
  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) throw new DashboardError('NOT_FOUND', 'Taak niet gevonden')
  await prisma.task.update({ where: { id }, data: { isActive: false } })
}

export async function toggleTaskAssignment(
  childId: string,
  taskId: string,
  assigned: boolean
): Promise<void> {
  if (assigned) {
    await prisma.childTask.upsert({
      where: { childId_taskId: { childId, taskId } },
      update: {},
      create: { childId, taskId },
    })
  } else {
    await prisma.childTask.deleteMany({ where: { childId, taskId } })
  }
}

export async function unlockAssignment(assignmentId: string): Promise<void> {
  const assignment = await prisma.taskAssignment.findUnique({
    where: { id: assignmentId },
  })

  if (!assignment) throw new DashboardError('NOT_FOUND', 'Taak niet gevonden')
  if (assignment.status !== 'pending') {
    throw new DashboardError('INVALID_STATUS', 'Taak is al ontgrendeld of afgerond')
  }

  await prisma.taskAssignment.update({
    where: { id: assignmentId },
    data: { status: 'unlocked', unlockedAt: new Date() },
  })
}

export async function giveBonusTask(childId: string, taskId: string): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task || task.type !== 'bonus' || !task.isActive) {
    throw new DashboardError('NOT_FOUND', 'Bonustaak niet gevonden')
  }

  const childTask = await prisma.childTask.findUnique({
    where: { childId_taskId: { childId, taskId } },
  })
  if (!childTask) {
    throw new DashboardError('VALIDATION', 'Taak is niet toegewezen aan dit kind')
  }

  const existing = await prisma.taskAssignment.findFirst({
    where: { childId, taskId, status: 'unlocked' },
  })
  if (existing) {
    throw new DashboardError('INVALID_STATUS', 'Bonustaak is al actief voor dit kind')
  }

  await prisma.taskAssignment.create({
    data: {
      childId,
      taskId,
      date: new Date(),
      status: 'unlocked',
      unlockedAt: new Date(),
    },
  })
}

export async function getChildrenWithHistory(): Promise<ChildWithHistory[]> {
  const children = await prisma.child.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      pointHistory: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  return children.map((child) => ({
    id: child.id,
    name: child.name,
    theme: child.theme,
    avatarEmoji: child.avatarEmoji,
    points: child.points,
    history: child.pointHistory.map((h) => ({
      id: h.id,
      delta: h.delta,
      reason: h.reason,
      sourceType: h.sourceType,
      createdAt: h.createdAt.toISOString(),
    })),
  }))
}

export async function adjustChildPoints(
  childId: string,
  delta: number,
  reason: string
): Promise<{ newPoints: number }> {
  const child = await prisma.child.findUnique({ where: { id: childId } })
  if (!child) throw new DashboardError('NOT_FOUND', 'Kind niet gevonden')

  const newPoints = Math.max(0, child.points + delta)

  await prisma.$transaction([
    prisma.child.update({
      where: { id: childId },
      data: {
        points: newPoints,
        ...(delta > 0 && { totalEarned: { increment: delta } }),
      },
    }),
    prisma.pointHistory.create({
      data: {
        childId,
        delta,
        reason,
        sourceType: 'manual',
      },
    }),
  ])

  return { newPoints }
}

export interface ChildProfile {
  id: string
  name: string
  theme: string
  avatarEmoji: string
  points: number
  sortOrder: number
}

export interface CreateChildInput {
  name: string
  theme: string
  avatarEmoji?: string
}

export interface UpdateChildInput {
  name?: string
  theme?: string
  avatarEmoji?: string
  sortOrder?: number
}

import { defaultEmojiForTheme, isChildTheme } from './child-themes'

export async function getChildProfiles(): Promise<ChildProfile[]> {
  const children = await prisma.child.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return children.map((c) => ({
    id: c.id,
    name: c.name,
    theme: c.theme,
    avatarEmoji: c.avatarEmoji,
    points: c.points,
    sortOrder: c.sortOrder,
  }))
}

export async function createChild(input: CreateChildInput): Promise<ChildProfile> {
  if (!input.name?.trim()) {
    throw new DashboardError('VALIDATION', 'Naam is verplicht')
  }
  if (!isChildTheme(input.theme)) {
    throw new DashboardError('VALIDATION', 'Ongeldige kleur/thema')
  }
  const theme = input.theme

  const maxSort = await prisma.child.aggregate({ _max: { sortOrder: true } })
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1

  const child = await prisma.child.create({
    data: {
      name: input.name.trim(),
      theme,
      avatarEmoji: input.avatarEmoji?.trim() || defaultEmojiForTheme(theme),
      sortOrder,
    },
  })

  return {
    id: child.id,
    name: child.name,
    theme: child.theme,
    avatarEmoji: child.avatarEmoji,
    points: child.points,
    sortOrder: child.sortOrder,
  }
}

export async function updateChild(
  id: string,
  input: UpdateChildInput
): Promise<ChildProfile> {
  const existing = await prisma.child.findUnique({ where: { id } })
  if (!existing) throw new DashboardError('NOT_FOUND', 'Kind niet gevonden')

  const theme =
    input.theme !== undefined
      ? isChildTheme(input.theme)
        ? input.theme
        : undefined
      : undefined

  if (input.theme !== undefined && !theme) {
    throw new DashboardError('VALIDATION', 'Ongeldige kleur/thema')
  }

  const child = await prisma.child.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(theme !== undefined && { theme }),
      ...(input.avatarEmoji !== undefined && {
        avatarEmoji: input.avatarEmoji.trim() || existing.avatarEmoji,
      }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    },
  })

  return {
    id: child.id,
    name: child.name,
    theme: child.theme,
    avatarEmoji: child.avatarEmoji,
    points: child.points,
    sortOrder: child.sortOrder,
  }
}

export async function deactivateChild(id: string): Promise<void> {
  const existing = await prisma.child.findUnique({ where: { id } })
  if (!existing) throw new DashboardError('NOT_FOUND', 'Kind niet gevonden')
  await prisma.child.update({ where: { id }, data: { isActive: false } })
}

export class DashboardError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'INVALID_STATUS' | 'VALIDATION',
    message: string
  ) {
    super(message)
    this.name = 'DashboardError'
  }
}
