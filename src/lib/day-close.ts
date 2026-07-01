import { startOfDay, startOfWeek } from 'date-fns'
import { prisma } from './prisma'

export interface MissedTaskResult {
  childId: string
  childName: string
  taskName: string
  taskEmoji: string
  pointsLost: number
}

export interface DayCloseResult {
  processed: number
  missed: MissedTaskResult[]
}

function todayStart(): Date {
  return startOfDay(new Date())
}

function weekStart(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

async function getDayCloseHour(): Promise<number> {
  const settings = await prisma.settings.findFirst()
  return settings?.dayCloseHour ?? 20
}

export async function processMissedAssignments(
  options: { forceToday?: boolean } = {}
): Promise<DayCloseResult> {
  const now = new Date()
  const today = todayStart()
  const week = weekStart()
  const dayCloseHour = await getDayCloseHour()
  const pastDayCloseToday = options.forceToday || now.getHours() >= dayCloseHour

  const incomplete = await prisma.taskAssignment.findMany({
    where: {
      status: { in: ['pending', 'unlocked'] },
      task: { type: { in: ['daily', 'weekly'] }, isActive: true },
    },
    include: {
      task: { select: { name: true, emoji: true, type: true, pointsLoss: true, recurrence: true } },
      child: { select: { id: true, name: true, points: true } },
    },
  })

  const toProcess = incomplete.filter((a) => {
    const assignmentDate = startOfDay(a.date)
    if (a.task.recurrence === 'weekly' || a.task.type === 'weekly') {
      return assignmentDate < week
    }
    if (assignmentDate < today) return true
    if (assignmentDate.getTime() === today.getTime() && pastDayCloseToday) return true
    return false
  })

  const missed: MissedTaskResult[] = []

  for (const assignment of toProcess) {
    const pointsLost = assignment.task.pointsLoss

    await prisma.$transaction(async (tx) => {
      await tx.taskAssignment.update({
        where: { id: assignment.id },
        data: { status: 'missed' },
      })

      if (pointsLost > 0) {
        const newPoints = Math.max(0, assignment.child.points - pointsLost)
        await tx.child.update({
          where: { id: assignment.childId },
          data: { points: newPoints },
        })

        await tx.pointHistory.create({
          data: {
            childId: assignment.childId,
            delta: -pointsLost,
            reason: `Taak niet gedaan: ${assignment.task.name}`,
            sourceType: 'task_missed',
            sourceId: assignment.id,
          },
        })
      }
    })

    if (pointsLost > 0) {
      missed.push({
        childId: assignment.child.id,
        childName: assignment.child.name,
        taskName: assignment.task.name,
        taskEmoji: assignment.task.emoji,
        pointsLost,
      })
    }
  }

  return { processed: toProcess.length, missed }
}
