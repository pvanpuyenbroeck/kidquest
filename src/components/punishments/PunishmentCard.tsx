'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { FamilyPunishment } from '@/lib/db'

interface PunishmentCardProps {
  punishment: FamilyPunishment
  index?: number
}

export function PunishmentCard({ punishment, index = 0 }: PunishmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'card flex flex-col items-center gap-1 p-3 min-w-[100px] text-center',
        'border-2 border-accent-red/20 bg-red-50/40'
      )}
    >
      <span className="text-2xl" role="img" aria-hidden="true">
        {punishment.emoji}
      </span>
      <p className="text-xs font-bold text-dark leading-tight">{punishment.name}</p>
      <div className="badge text-xs mt-1 bg-accent-red/15 text-accent-red">
        <span>-{punishment.pointsLoss} ⭐</span>
      </div>
      {punishment.reason && (
        <p className="text-[10px] text-dark/50 font-medium mt-0.5 line-clamp-2">
          {punishment.reason}
        </p>
      )}
    </motion.div>
  )
}
