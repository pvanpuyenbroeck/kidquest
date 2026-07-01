import { startOfDay } from 'date-fns'
import { prisma } from './prisma'

export interface DailyPointsResetResult {
  reset: boolean
  dailyStartPoints: number
  childrenUpdated: number
}

function todayStart(): Date {
  return startOfDay(new Date())
}

export async function processDailyPointsReset(): Promise<DailyPointsResetResult> {
  const today = todayStart()
  const settings = await prisma.settings.findFirst()

  if (!settings) {
    return { reset: false, dailyStartPoints: 0, childrenUpdated: 0 }
  }

  const lastStarted = settings.lastDayStarted
    ? startOfDay(settings.lastDayStarted)
    : null

  if (lastStarted && lastStarted.getTime() === today.getTime()) {
    return {
      reset: false,
      dailyStartPoints: settings.dailyStartPoints,
      childrenUpdated: 0,
    }
  }

  const children = await prisma.child.findMany({
    where: { isActive: true },
    select: { id: true, points: true },
  })

  let childrenUpdated = 0

  await prisma.$transaction(async (tx) => {
    for (const child of children) {
      if (child.points === settings.dailyStartPoints) continue

      const delta = settings.dailyStartPoints - child.points
      await tx.child.update({
        where: { id: child.id },
        data: { points: settings.dailyStartPoints },
      })
      await tx.pointHistory.create({
        data: {
          childId: child.id,
          delta,
          reason: `Dagstart: ${settings.dailyStartPoints} punten`,
          sourceType: 'day_start',
        },
      })
      childrenUpdated++
    }

    await tx.settings.update({
      where: { id: settings.id },
      data: { lastDayStarted: today },
    })
  })

  return {
    reset: true,
    dailyStartPoints: settings.dailyStartPoints,
    childrenUpdated,
  }
}
