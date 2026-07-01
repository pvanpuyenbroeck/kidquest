'use client'

import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getChildTheme } from '@/lib/child-themes'
import { useParentAuthStore } from '@/stores/parentAuthStore'
import type { ChildTheme } from '@/lib/db'
import type { FamilyReward } from '@/lib/db'

interface RewardCardProps {
  reward: FamilyReward
  childId: string
  childName: string
  childPoints: number
  theme: ChildTheme
  claimedToday?: boolean
  index?: number
}

export function RewardCard({
  reward,
  childId,
  childName,
  childPoints,
  theme,
  claimedToday = false,
  index = 0,
}: RewardCardProps) {
  const { isAuthenticated, requestRewardClaim } = useParentAuthStore()
  const affordable = childPoints >= reward.pointsCost
  const available =
    reward.availableTo === 'all' || reward.availableTo === childId

  if (!available) return null

  function handleClick() {
    if (!affordable || claimedToday) return

    if (!isAuthenticated) {
      toast('Roep mama of papa! 👋', {
        description: 'Eerst de ouder-pincode invoeren.',
        duration: 3000,
      })
    }

    requestRewardClaim({
      childId,
      rewardId: reward.id,
      rewardName: reward.name,
      rewardEmoji: reward.emoji,
      childName,
    })
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={handleClick}
      disabled={!affordable || claimedToday}
      className={cn(
        'card flex flex-col items-center gap-1 p-3 min-w-[100px] text-center transition-transform',
        claimedToday && 'opacity-60 ring-2 ring-accent-green/30 bg-accent-green/5',
        !claimedToday && affordable && isAuthenticated && 'hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer',
        !claimedToday && affordable && !isAuthenticated && 'cursor-pointer',
        !claimedToday && !affordable && 'opacity-50 grayscale cursor-not-allowed',
        !claimedToday && affordable && 'ring-2 ring-transparent',
        !claimedToday && affordable && getChildTheme(theme).hoverRing
      )}
    >
      <span className="text-2xl" role="img" aria-hidden="true">
        {reward.emoji}
      </span>
      <p className="text-xs font-bold text-dark leading-tight">{reward.name}</p>
      {claimedToday ? (
        <div className="badge text-xs mt-1 bg-accent-green/20 text-accent-green flex items-center gap-1">
          <Check className="h-3 w-3" />
          <span>Vandaag gehad</span>
        </div>
      ) : (
        <div
          className={cn(
            'badge text-xs mt-1',
            affordable
              ? 'bg-accent-yellow/20 text-earth-600'
              : 'bg-cream-200 text-dark/40'
          )}
        >
          {!affordable && <Lock className="h-3 w-3" />}
          <span>⭐ {reward.pointsCost}</span>
        </div>
      )}
      {affordable && !isAuthenticated && !claimedToday && (
        <p className="text-[10px] text-dark/40 font-medium mt-0.5">Tik om te claimen</p>
      )}
    </motion.button>
  )
}
