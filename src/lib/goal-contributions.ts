import { resolveChildTheme, type ChildTheme } from './child-themes'
import { prisma } from './prisma'

export interface GoalChildContribution {
  childId: string
  childName: string
  theme: ChildTheme
  amount: number
  percent: number
}

export async function getContributionsByGoalIds(
  goalIds: string[]
): Promise<Map<string, GoalChildContribution[]>> {
  if (goalIds.length === 0) return new Map()

  const rows = await prisma.goalContribution.findMany({
    where: { goalId: { in: goalIds } },
    include: {
      child: { select: { id: true, name: true, theme: true, sortOrder: true } },
    },
  })

  const byGoal = new Map<string, Map<string, { child: (typeof rows)[0]['child']; amount: number }>>()

  for (const row of rows) {
    const goalMap = byGoal.get(row.goalId) ?? new Map()
    const existing = goalMap.get(row.childId)
    goalMap.set(row.childId, {
      child: row.child,
      amount: (existing?.amount ?? 0) + row.amount,
    })
    byGoal.set(row.goalId, goalMap)
  }

  const result = new Map<string, GoalChildContribution[]>()

  for (const [goalId, childMap] of Array.from(byGoal.entries())) {
    const items = Array.from(childMap.values())
    const total = items.reduce((sum, item) => sum + item.amount, 0)
    if (total <= 0) continue

    const contributions = items
      .map(({ child, amount }) => ({
        childId: child.id,
        childName: child.name,
        theme: resolveChildTheme(child.theme),
        amount,
        percent: Math.round((amount / total) * 100),
      }))
      .sort((a, b) => {
        const orderA = childMap.get(a.childId)?.child.sortOrder ?? 0
        const orderB = childMap.get(b.childId)?.child.sortOrder ?? 0
        return orderA - orderB
      })

    result.set(goalId, contributions)
  }

  return result
}
