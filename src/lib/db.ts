import { format, startOfDay, startOfWeek } from 'date-fns'
import { nl } from 'date-fns/locale'
import { resolveChildTheme, type ChildTheme } from './child-themes'
import { getContributionsByGoalIds, type GoalChildContribution } from './goal-contributions'
import { processMissedAssignments } from './day-close'
import { processDailyPointsReset } from './day-start'
import { prisma } from './prisma'

export type { ChildTheme }

export type TaskStatus = 'pending' | 'unlocked' | 'completed' | 'missed'

export interface FamilyAssignment {
  id: string
  status: TaskStatus
  task: {
    id: string
    name: string
    emoji: string
    type: string
    pointsReward: number
    pointsLoss: number
    mediaUrl?: string | null
    mediaType?: string | null
  }
}

export interface UnlockedMedia {
  id: string
  taskName: string
  taskEmoji: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  unlockedAt: string
}

export interface FamilyPunishment {
  id: string
  name: string
  emoji: string
  pointsLoss: number
  reason: string | null
  givenAt: string
}

export interface FamilyChild {
  id: string
  name: string
  theme: ChildTheme
  avatarEmoji: string
  points: number
  assignments: FamilyAssignment[]
  bonusAssignments: FamilyAssignment[]
  unlockedMedia: UnlockedMedia[]
  personalGoals: FamilyGoal[]
  claimedRewardIdsToday: string[]
  punishmentsToday: FamilyPunishment[]
}

export interface FamilyReward {
  id: string
  name: string
  emoji: string
  pointsCost: number
  availableTo: string
}

export interface FamilyToday {
  date: string
  label: string
}

export interface FamilyGoal {
  id: string
  name: string
  emoji: string
  description: string | null
  targetPoints: number
  currentPoints: number
  availableTo: string
  isCompleted: boolean
  progressPercent: number
  contributions: GoalChildContribution[]
}

export interface FamilyScreenData {
  familyName: string
  today: FamilyToday
  children: FamilyChild[]
  rewards: FamilyReward[]
  sharedGoals: FamilyGoal[]
}

function todayStart(): Date {
  return startOfDay(new Date())
}

function weekStart(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

function getTodayInfo(): FamilyToday {
  const now = new Date()
  return {
    date: format(now, 'yyyy-MM-dd'),
    label: format(now, 'EEEE d MMMM yyyy', { locale: nl }),
  }
}

async function getClaimedRewardIdsToday(childId: string): Promise<string[]> {
  const today = todayStart()
  const claims = await prisma.rewardClaim.findMany({
    where: {
      childId,
      claimedAt: { gte: today },
    },
    select: { rewardId: true },
  })
  return claims.map((c) => c.rewardId)
}

async function getPunishmentsTodayForChild(childId: string): Promise<FamilyPunishment[]> {
  const today = todayStart()
  const records = await prisma.childPunishment.findMany({
    where: {
      childId,
      givenAt: { gte: today },
    },
    include: {
      punishment: {
        select: { name: true, emoji: true, pointsLoss: true },
      },
    },
    orderBy: { givenAt: 'desc' },
  })

  return records.map((r) => ({
    id: r.id,
    name: r.punishment.name,
    emoji: r.punishment.emoji,
    pointsLoss: r.punishment.pointsLoss,
    reason: r.reason,
    givenAt: r.givenAt.toISOString(),
  }))
}

function inferMediaType(url: string, mediaType?: string | null): 'image' | 'video' {
  if (mediaType === 'video' || mediaType === 'image') return mediaType
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video'
  return 'image'
}

function mapAssignment(a: {
  id: string
  status: string
  task: {
    id: string
    name: string
    emoji: string
    type: string
    pointsReward: number
    pointsLoss: number
    mediaUrl?: string | null
    mediaType?: string | null
  }
}): FamilyAssignment {
  return {
    id: a.id,
    status: a.status as TaskStatus,
    task: a.task,
  }
}

export async function getBonusAssignmentsForChild(childId: string) {
  return prisma.taskAssignment.findMany({
    where: {
      childId,
      status: 'unlocked',
      task: { type: 'bonus', isActive: true },
    },
    include: {
      task: {
        select: {
          id: true,
          name: true,
          emoji: true,
          type: true,
          pointsReward: true,
          pointsLoss: true,
          mediaUrl: true,
          mediaType: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUnlockedMediaForChild(childId: string): Promise<UnlockedMedia[]> {
  const completed = await prisma.taskAssignment.findMany({
    where: {
      childId,
      status: 'completed',
      task: { type: 'bonus', mediaUrl: { not: null } },
    },
    include: {
      task: {
        select: { name: true, emoji: true, mediaUrl: true, mediaType: true },
      },
    },
    orderBy: { completedAt: 'desc' },
    take: 20,
  })

  return completed
    .filter((a) => a.task.mediaUrl)
    .map((a) => ({
      id: a.id,
      taskName: a.task.name,
      taskEmoji: a.task.emoji,
      mediaUrl: a.task.mediaUrl!,
      mediaType: inferMediaType(a.task.mediaUrl!, a.task.mediaType),
      unlockedAt: (a.completedAt ?? a.createdAt).toISOString(),
    }))
}

function assignmentDateForTask(recurrence: string | null): Date {
  if (recurrence === 'weekly') return weekStart()
  return todayStart()
}

export async function getActiveChildren() {
  return prisma.child.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getOrCreateTodayAssignments(childId: string) {
  const today = todayStart()
  const week = weekStart()

  const childTasks = await prisma.childTask.findMany({
    where: { childId },
    include: { task: true },
  })

  const relevantTasks = childTasks
    .map((ct) => ct.task)
    .filter((task) => task.isActive && task.type !== 'bonus')

  for (const task of relevantTasks) {
    const date = assignmentDateForTask(task.recurrence)
    const existing = await prisma.taskAssignment.findFirst({
      where: { childId, taskId: task.id, date },
    })

    if (!existing) {
      const isWeekly = task.recurrence === 'weekly'
      const isMonday = new Date().getDay() === 1
      const defaultStatus = isWeekly && !isMonday ? 'pending' : 'unlocked'

      await prisma.taskAssignment.create({
        data: {
          childId,
          taskId: task.id,
          date,
          status: defaultStatus,
          ...(defaultStatus === 'unlocked' ? { unlockedAt: new Date() } : {}),
        },
      })
    }
  }

  return prisma.taskAssignment.findMany({
    where: {
      childId,
      OR: [{ date: today }, { date: week }],
      task: { type: { not: 'bonus' } },
    },
    include: {
      task: {
        select: {
          id: true,
          name: true,
          emoji: true,
          type: true,
          pointsReward: true,
          pointsLoss: true,
        },
      },
    },
    orderBy: { task: { type: 'asc' } },
  })
}

export async function getFamilyScreenData(): Promise<FamilyScreenData> {
  await processMissedAssignments()
  await processDailyPointsReset()

  const [settings, children, rewards, goals] = await Promise.all([
    prisma.settings.findFirst(),
    getActiveChildren(),
    prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: 'asc' },
      select: { id: true, name: true, emoji: true, pointsCost: true, availableTo: true },
    }),
    prisma.savingsGoal.findMany({
      where: { isActive: true, isCompleted: false },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const contributionsByGoal = await getContributionsByGoalIds(goals.map((g) => g.id))

  const mapGoal = (g: (typeof goals)[0]): FamilyGoal => ({
    id: g.id,
    name: g.name,
    emoji: g.emoji,
    description: g.description,
    targetPoints: g.targetPoints,
    currentPoints: g.currentPoints,
    availableTo: g.availableTo,
    isCompleted: g.isCompleted,
    progressPercent: Math.min(100, Math.round((g.currentPoints / g.targetPoints) * 100)),
    contributions: contributionsByGoal.get(g.id) ?? [],
  })

  const sharedGoals: FamilyGoal[] = goals
    .filter((g) => g.availableTo === 'all')
    .map(mapGoal)

  const childrenWithAssignments = await Promise.all(
    children.map(async (child) => {
      const [assignments, bonusAssignments, unlockedMedia, claimedRewardIdsToday, punishmentsToday] =
        await Promise.all([
          getOrCreateTodayAssignments(child.id),
          getBonusAssignmentsForChild(child.id),
          getUnlockedMediaForChild(child.id),
          getClaimedRewardIdsToday(child.id),
          getPunishmentsTodayForChild(child.id),
        ])
      return {
        id: child.id,
        name: child.name,
        theme: resolveChildTheme(child.theme),
        avatarEmoji: child.avatarEmoji,
        points: child.points,
        assignments: assignments.map(mapAssignment),
        bonusAssignments: bonusAssignments.map(mapAssignment),
        unlockedMedia,
        personalGoals: goals.filter((g) => g.availableTo === child.id).map(mapGoal),
        claimedRewardIdsToday,
        punishmentsToday,
      }
    })
  )

  return {
    familyName: settings?.familyName ?? 'Onze Familie',
    today: getTodayInfo(),
    children: childrenWithAssignments,
    rewards,
    sharedGoals,
  }
}

export class TaskCompleteError extends Error {
  constructor(
    public code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'INVALID_STATUS',
    message: string
  ) {
    super(message)
    this.name = 'TaskCompleteError'
  }
}

export interface TaskCompleteResult {
  childId: string
  childName: string
  taskName: string
  taskEmoji: string
  pointsEarned: number
  newPoints: number
  mediaUrl?: string | null
  mediaType?: 'image' | 'video' | null
}

export async function completeTaskAssignment(
  assignmentId: string
): Promise<TaskCompleteResult> {
  const assignment = await prisma.taskAssignment.findUnique({
    where: { id: assignmentId },
    include: { task: true, child: true },
  })

  if (!assignment) {
    throw new TaskCompleteError('NOT_FOUND', 'Taak niet gevonden')
  }

  if (assignment.status !== 'unlocked') {
    throw new TaskCompleteError('INVALID_STATUS', 'Taak kan niet afgevinkt worden')
  }

  const { task, child } = assignment
  // Bonustaken: pointsReward. Standaard taken: punten = pointsLoss (symmetrisch met straf bij missen).
  const pointsEarned =
    task.type === 'bonus' ? task.pointsReward : task.pointsLoss > 0 ? task.pointsLoss : 0

  const updatedChild = await prisma.$transaction(async (tx) => {
    await tx.taskAssignment.update({
      where: { id: assignmentId },
      data: { status: 'completed', completedAt: new Date() },
    })

    if (pointsEarned > 0) {
      return tx.child.update({
        where: { id: child.id },
        data: {
          points: { increment: pointsEarned },
          totalEarned: { increment: pointsEarned },
        },
      })
    }

    return tx.child.findUniqueOrThrow({ where: { id: child.id } })
  })

  await prisma.pointHistory.create({
    data: {
      childId: child.id,
      delta: pointsEarned,
      reason: `Taak voltooid: ${task.name}`,
      sourceType: task.type === 'bonus' ? 'bonus' : 'task_complete',
      sourceId: assignmentId,
    },
  })

  return {
    childId: child.id,
    childName: child.name,
    taskName: task.name,
    taskEmoji: task.emoji,
    pointsEarned,
    newPoints: updatedChild.points,
    mediaUrl: task.type === 'bonus' ? task.mediaUrl : null,
    mediaType:
      task.type === 'bonus' && task.mediaUrl
        ? inferMediaType(task.mediaUrl, task.mediaType)
        : null,
  }
}

export class RewardClaimError extends Error {
  constructor(
    public code:
      | 'UNAUTHORIZED'
      | 'NOT_FOUND'
      | 'INSUFFICIENT_POINTS'
      | 'NOT_AVAILABLE'
      | 'ALREADY_CLAIMED_TODAY',
    message: string
  ) {
    super(message)
    this.name = 'RewardClaimError'
  }
}

export interface RewardClaimResult {
  childId: string
  childName: string
  rewardName: string
  rewardEmoji: string
  pointsSpent: number
  newPoints: number
}

export async function claimReward(
  childId: string,
  rewardId: string
): Promise<RewardClaimResult> {
  const [child, reward] = await Promise.all([
    prisma.child.findUnique({ where: { id: childId } }),
    prisma.reward.findUnique({ where: { id: rewardId } }),
  ])

  if (!child || !reward || !reward.isActive) {
    throw new RewardClaimError('NOT_FOUND', 'Beloning niet gevonden')
  }

  if (reward.availableTo !== 'all' && reward.availableTo !== childId) {
    throw new RewardClaimError('NOT_AVAILABLE', 'Beloning niet beschikbaar voor dit kind')
  }

  if (child.points < reward.pointsCost) {
    throw new RewardClaimError('INSUFFICIENT_POINTS', 'Niet genoeg punten')
  }

  const today = todayStart()
  const alreadyClaimedToday = await prisma.rewardClaim.findFirst({
    where: {
      childId,
      rewardId,
      claimedAt: { gte: today },
    },
  })

  if (alreadyClaimedToday) {
    throw new RewardClaimError(
      'ALREADY_CLAIMED_TODAY',
      'Deze beloning is vandaag al geclaimd'
    )
  }

  const newPoints = child.points - reward.pointsCost

  await prisma.$transaction([
    prisma.child.update({
      where: { id: childId },
      data: { points: newPoints },
    }),
    prisma.rewardClaim.create({
      data: { childId, rewardId },
    }),
    prisma.pointHistory.create({
      data: {
        childId,
        delta: -reward.pointsCost,
        reason: `Beloning: ${reward.name}`,
        sourceType: 'reward_claim',
        sourceId: rewardId,
      },
    }),
  ])

  return {
    childId: child.id,
    childName: child.name,
    rewardName: reward.name,
    rewardEmoji: reward.emoji,
    pointsSpent: reward.pointsCost,
    newPoints,
  }
}

export class GoalContributeError extends Error {
  constructor(
    public code:
      | 'UNAUTHORIZED'
      | 'NOT_FOUND'
      | 'INSUFFICIENT_POINTS'
      | 'NOT_AVAILABLE'
      | 'ALREADY_COMPLETED'
      | 'INVALID_AMOUNT',
    message: string
  ) {
    super(message)
    this.name = 'GoalContributeError'
  }
}

export interface GoalContributeResult {
  childId: string
  childName: string
  goalId: string
  goalName: string
  goalEmoji: string
  amount: number
  newPoints: number
  goalCurrentPoints: number
  goalTargetPoints: number
  goalReached: boolean
}

export async function contributeToGoal(
  childId: string,
  goalId: string,
  amount: number
): Promise<GoalContributeResult> {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new GoalContributeError('INVALID_AMOUNT', 'Ongeldig aantal punten')
  }

  const [child, goal] = await Promise.all([
    prisma.child.findUnique({ where: { id: childId } }),
    prisma.savingsGoal.findUnique({ where: { id: goalId } }),
  ])

  if (!child || !goal || !goal.isActive) {
    throw new GoalContributeError('NOT_FOUND', 'Doel niet gevonden')
  }

  if (goal.isCompleted) {
    throw new GoalContributeError('ALREADY_COMPLETED', 'Dit doel is al bereikt')
  }

  if (goal.availableTo !== 'all' && goal.availableTo !== childId) {
    throw new GoalContributeError('NOT_AVAILABLE', 'Doel niet beschikbaar voor dit kind')
  }

  if (child.points < amount) {
    throw new GoalContributeError('INSUFFICIENT_POINTS', 'Niet genoeg punten')
  }

  const newGoalPoints = goal.currentPoints + amount
  const goalReached = newGoalPoints >= goal.targetPoints

  const updatedChild = await prisma.$transaction(async (tx) => {
    await tx.child.update({
      where: { id: childId },
      data: { points: { decrement: amount } },
    })

    await tx.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentPoints: newGoalPoints,
        ...(goalReached
          ? { isCompleted: true, completedAt: new Date() }
          : {}),
      },
    })

    await tx.goalContribution.create({
      data: { goalId, childId, amount },
    })

    await tx.pointHistory.create({
      data: {
        childId,
        delta: -amount,
        reason: `Spaardoel: ${goal.name}`,
        sourceType: 'goal_contribution',
        sourceId: goalId,
      },
    })

    return tx.child.findUniqueOrThrow({ where: { id: childId } })
  })

  return {
    childId: child.id,
    childName: child.name,
    goalId: goal.id,
    goalName: goal.name,
    goalEmoji: goal.emoji,
    amount,
    newPoints: updatedChild.points,
    goalCurrentPoints: newGoalPoints,
    goalTargetPoints: goal.targetPoints,
    goalReached,
  }
}
