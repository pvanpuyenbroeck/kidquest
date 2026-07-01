'use client'

import { motion } from 'framer-motion'
import { getChildTheme } from '@/lib/child-themes'
import type { GoalChildContribution } from '@/lib/goal-contributions'
import { cn } from '@/lib/utils'

interface GoalContributionBreakdownProps {
  contributions: GoalChildContribution[]
  progressPercent: number
  compact?: boolean
  animate?: boolean
}

export function GoalContributionBreakdown({
  contributions,
  progressPercent,
  compact = false,
  animate = true,
}: GoalContributionBreakdownProps) {
  if (contributions.length === 0) return null

  const barHeight = compact ? 'h-2.5' : 'h-3'
  const BarWrapper = animate ? motion.div : 'div'
  const barProps = animate
    ? {
        initial: { width: 0 },
        animate: { width: `${progressPercent}%` },
        transition: { duration: 0.8, ease: 'easeOut' as const },
      }
    : { style: { width: `${progressPercent}%` } }

  return (
    <div className="space-y-1.5">
      <div className={cn(barHeight, 'bg-cream-200 rounded-full overflow-hidden')}>
        <BarWrapper
          {...barProps}
          className="h-full flex overflow-hidden rounded-r-full"
        >
          {contributions.map((contribution) => (
            <div
              key={contribution.childId}
              className="h-full"
              style={{
                width: `${contribution.percent}%`,
                backgroundColor: getChildTheme(contribution.theme).color,
              }}
              title={`${contribution.childName}: ${contribution.amount} punten`}
            />
          ))}
        </BarWrapper>
      </div>

      <div className={cn('flex flex-wrap gap-x-3 gap-y-1', compact ? 'text-[11px]' : 'text-xs')}>
        {contributions.map((contribution) => (
          <span
            key={contribution.childId}
            className="inline-flex items-center gap-1.5 text-dark/70"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getChildTheme(contribution.theme).color }}
              aria-hidden
            />
            <span>
              <span className="font-bold text-dark/80">{contribution.childName}</span>
              {': '}
              {contribution.amount} ⭐ ({contribution.percent}%)
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
