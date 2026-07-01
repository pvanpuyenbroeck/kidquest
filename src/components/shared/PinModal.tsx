'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PinKeypad } from '@/components/shared/PinKeypad'
import { useParentAuthStore } from '@/stores/parentAuthStore'

export function PinModal() {
  const {
    showPinModal,
    pendingTask,
    pendingReward,
    pendingGoal,
    closePinModal,
    setAuthenticated,
    completeTask,
    claimReward,
    contributeToGoal,
  } = useParentAuthStore()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    if (showPinModal) {
      setError(false)
      setLoading(false)
      setResetKey((k) => k + 1)
    }
  }, [showPinModal])

  const handleSubmit = useCallback(
    async (enteredPin: string) => {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: enteredPin }),
        })

        if (!res.ok) {
          setError(true)
          setLoading(false)
          setResetKey((k) => k + 1)
          return
        }

      setAuthenticated(true)
      const { pendingTask: task, pendingReward: reward, pendingGoal: goal } =
        useParentAuthStore.getState()
      closePinModal()

      if (task) {
        await completeTask(task.assignmentId)
      } else if (reward) {
        await claimReward(reward.childId, reward.rewardId)
      } else if (goal) {
        await contributeToGoal(goal.childId, goal.goalId, goal.amount)
      }
      } catch {
        setError(true)
        setLoading(false)
        setResetKey((k) => k + 1)
      }
    },
    [setAuthenticated, closePinModal, completeTask, claimReward, contributeToGoal]
  )

  return (
    <AnimatePresence>
      {showPinModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm"
          onClick={closePinModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className={cn(
              'card relative w-full max-w-sm p-6 space-y-5',
              error && 'animate-shake'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePinModal}
              className="absolute top-4 right-4 p-2 rounded-xl text-dark/30 hover:text-dark/60 hover:bg-cream-100 transition-colors"
              aria-label="Sluiten"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <span className="text-4xl" role="img" aria-hidden="true">
                🔒
              </span>
              <h2 className="font-display text-xl font-extrabold text-dark">
                Ouder-pincode
              </h2>
              {pendingTask ? (
                <p className="text-dark/60 font-medium text-sm">
                  Voer de pincode in om{' '}
                  <span className="font-bold">{pendingTask.taskName}</span> van{' '}
                  {pendingTask.childName} af te vinken
                </p>
              ) : pendingReward ? (
                <p className="text-dark/60 font-medium text-sm">
                  Voer de pincode in om{' '}
                  <span className="font-bold">{pendingReward.rewardName}</span> voor{' '}
                  {pendingReward.childName} te claimen
                </p>
              ) : pendingGoal ? (
                <p className="text-dark/60 font-medium text-sm">
                  Voer de pincode in om{' '}
                  <span className="font-bold">⭐ {pendingGoal.amount} punten</span> te storten
                  voor {pendingGoal.goalName} ({pendingGoal.childName})
                </p>
              ) : (
                <p className="text-dark/60 font-medium text-sm">
                  Voer de pincode in om taken af te vinken
                </p>
              )}
            </div>

            <PinKeypad
              onSubmit={handleSubmit}
              submitLabel="Ontgrendelen"
              loading={loading}
              error={error}
              resetKey={resetKey}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
