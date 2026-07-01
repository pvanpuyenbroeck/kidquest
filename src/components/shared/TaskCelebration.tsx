'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TaskCompleteResult } from '@/lib/db'

interface TaskCelebrationProps {
  result: TaskCompleteResult | null
  onDone: () => void
}

const STARS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 300,
  delay: Math.random() * 0.3,
}))

export function TaskCelebration({ result, onDone }: TaskCelebrationProps) {
  useEffect(() => {
    if (!result) return
    const timer = setTimeout(onDone, 2500)
    return () => clearTimeout(timer)
  }, [result, onDone])

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
        >
          {/* Confetti sterren */}
          {STARS.map((star) => (
            <motion.span
              key={star.id}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, 1.2, 0.8],
                x: star.x,
                y: -120 - Math.random() * 80,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1.2, delay: star.delay, ease: 'easeOut' }}
              className="absolute text-2xl"
              role="img"
              aria-hidden="true"
            >
              ⭐
            </motion.span>
          ))}

          {/* Succes kaart */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="card px-10 py-8 text-center shadow-card-hover"
          >
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="text-6xl block mb-3"
              role="img"
              aria-hidden="true"
            >
              {result.taskEmoji}
            </motion.span>
            <p className="font-display text-2xl font-extrabold text-dark">
              Goed gedaan, {result.childName}! 🎉
            </p>
            <p className="text-dark/60 font-medium mt-1">{result.taskName}</p>
            {result.pointsEarned > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="badge-points text-lg mt-4 inline-flex"
              >
                +{result.pointsEarned} punten!
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
