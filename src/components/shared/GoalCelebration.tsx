'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { GoalContributeResult } from '@/lib/db'

interface GoalCelebrationProps {
  result: GoalContributeResult | null
  onDone: () => void
}

const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 350,
  delay: Math.random() * 0.4,
  emoji: ['🎉', '⭐', '🎯', '🦕', '🦄'][i % 5],
}))

export function GoalCelebration({ result, onDone }: GoalCelebrationProps) {
  useEffect(() => {
    if (!result?.goalReached) return
    const timer = setTimeout(onDone, 3500)
    return () => clearTimeout(timer)
  }, [result, onDone])

  return (
    <AnimatePresence>
      {result?.goalReached && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
        >
          {CONFETTI.map((item) => (
            <motion.span
              key={item.id}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, 1.3, 0.9],
                x: item.x,
                y: -140 - Math.random() * 100,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1.4, delay: item.delay, ease: 'easeOut' }}
              className="absolute text-3xl"
              role="img"
              aria-hidden
            >
              {item.emoji}
            </motion.span>
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="card px-10 py-8 text-center shadow-card-hover max-w-sm"
          >
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="text-6xl block mb-3"
              role="img"
              aria-hidden
            >
              {result.goalEmoji}
            </motion.span>
            <p className="font-display text-2xl font-extrabold text-dark">
              Doel bereikt! 🎉
            </p>
            <p className="text-dark/60 font-medium mt-1">{result.goalName}</p>
            <p className="text-sm text-dark/50 mt-3">
              Jullie hebben genoeg punten gespaard!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
