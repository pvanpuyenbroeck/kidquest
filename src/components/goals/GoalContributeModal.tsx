'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { FamilyGoal } from '@/lib/db'
import { useParentAuthStore } from '@/stores/parentAuthStore'

interface GoalContributeModalProps {
  goal: FamilyGoal
  childId: string
  childName: string
  childPoints: number
  onClose: () => void
}

const PRESETS = [5, 10, 20, 50]

export function GoalContributeModal({
  goal,
  childId,
  childName,
  childPoints,
  onClose,
}: GoalContributeModalProps) {
  const { requestGoalContribute } = useParentAuthStore()
  const [amount, setAmount] = useState(
    PRESETS.find((p) => p <= childPoints) ?? childPoints
  )
  const [loading, setLoading] = useState(false)

  const remaining = goal.targetPoints - goal.currentPoints
  const maxAmount = Math.min(childPoints, remaining)

  async function handleContribute() {
    if (amount <= 0 || amount > maxAmount) {
      toast.error('Ongeldig aantal punten')
      return
    }

    setLoading(true)
    try {
      await requestGoalContribute({
        childId,
        goalId: goal.id,
        goalName: goal.name,
        goalEmoji: goal.emoji,
        childName,
        amount,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="card relative w-full max-w-sm p-6 space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-dark/30 hover:text-dark/60 hover:bg-cream-100"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center space-y-2 pt-2">
            <span className="text-4xl" role="img" aria-hidden>
              {goal.emoji}
            </span>
            <h2 className="font-display text-xl font-extrabold text-dark">
              Punten storten
            </h2>
            <p className="text-dark/60 font-medium text-sm">
              {childName} spaart voor <span className="font-bold">{goal.name}</span>
            </p>
            <p className="text-xs text-dark/40">
              Nog {remaining} punten nodig · {childPoints} punten beschikbaar
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {PRESETS.filter((p) => p <= maxAmount).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={cn(
                  'px-4 py-2 rounded-2xl font-bold text-sm transition-colors',
                  amount === preset
                    ? 'bg-accent-orange text-white'
                    : 'bg-cream-100 text-dark/60 hover:bg-cream-200'
                )}
              >
                ⭐ {preset}
              </button>
            ))}
            {maxAmount > 0 && (
              <button
                type="button"
                onClick={() => setAmount(maxAmount)}
                className={cn(
                  'px-4 py-2 rounded-2xl font-bold text-sm transition-colors',
                  amount === maxAmount
                    ? 'bg-accent-orange text-white'
                    : 'bg-cream-100 text-dark/60 hover:bg-cream-200'
                )}
              >
                Alles ({maxAmount})
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-dark/50 mb-1 block">
              Aantal punten
            </label>
            <input
              type="number"
              min={1}
              max={maxAmount}
              className="input text-center text-lg font-bold"
              value={amount}
              onChange={(e) => setAmount(Math.min(maxAmount, Math.max(1, Number(e.target.value))))}
            />
          </div>

          <button
            onClick={handleContribute}
            disabled={loading || amount <= 0 || amount > maxAmount}
            className="btn-primary w-full"
          >
            {loading ? 'Storten...' : `⭐ ${amount} punten storten`}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
