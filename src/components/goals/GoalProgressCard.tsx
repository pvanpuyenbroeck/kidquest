'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getChildTheme } from '@/lib/child-themes'
import type { ChildTheme, FamilyGoal } from '@/lib/db'
import { GoalContributeModal } from '@/components/goals/GoalContributeModal'
import { GoalContributionBreakdown } from '@/components/goals/GoalContributionBreakdown'

interface GoalProgressCardProps {
  goal: FamilyGoal
  childId: string
  childName: string
  childPoints: number
  theme?: ChildTheme
  index?: number
  compact?: boolean
}

export function GoalProgressCard({
  goal,
  childId,
  childName,
  childPoints,
  theme,
  index = 0,
  compact = false,
}: GoalProgressCardProps) {
  const [showModal, setShowModal] = useState(false)
  const canContribute = childPoints > 0

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.35 }}
        className={cn(
          'card border-2 bg-gradient-to-br from-white to-cream-50',
          theme ? getChildTheme(theme).cardBorder : 'border-accent-orange/30'
        )}
      >
        <div className={cn('flex items-start gap-3', compact ? 'p-3' : 'p-4')}>
          <span className={cn('shrink-0', compact ? 'text-2xl' : 'text-3xl')} role="img" aria-hidden>
            {goal.emoji}
          </span>
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className={cn('font-bold text-dark', compact ? 'text-sm' : 'text-base')}>
                {goal.name}
              </p>
              {goal.description && !compact && (
                <p className="text-xs text-dark/50 mt-0.5">{goal.description}</p>
              )}
              <p className="text-xs font-bold text-dark/60 mt-1">
                ⭐ {goal.currentPoints} / {goal.targetPoints} punten ({goal.progressPercent}%)
              </p>
            </div>

            {goal.contributions.length > 0 ? (
              <GoalContributionBreakdown
                contributions={goal.contributions}
                progressPercent={goal.progressPercent}
                compact={compact}
              />
            ) : (
              <div className="h-2.5 bg-cream-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-accent-orange rounded-full"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowModal(true)}
              disabled={!canContribute}
              className={cn(
                'text-xs font-bold px-3 py-1.5 rounded-xl transition-colors',
                canContribute
                  ? 'bg-accent-orange text-white hover:bg-accent-orange/90'
                  : 'bg-cream-200 text-dark/30 cursor-not-allowed'
              )}
            >
              {canContribute ? '⭐ Punten storten' : 'Geen punten om te storten'}
            </button>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <GoalContributeModal
          goal={goal}
          childId={childId}
          childName={childName}
          childPoints={childPoints}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
