'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export interface MediaUnlockData {
  taskName: string
  taskEmoji: string
  childName: string
  mediaUrl: string
  mediaType: 'image' | 'video'
}

interface MediaUnlockModalProps {
  media: MediaUnlockData | null
  onClose: () => void
}

export function MediaUnlockModal({ media, onClose }: MediaUnlockModalProps) {
  return (
    <AnimatePresence>
      {media && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card relative w-full max-w-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-dark/30 hover:text-dark/60 hover:bg-cream-100"
              aria-label="Sluiten"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <span className="text-4xl" role="img" aria-hidden="true">
                {media.taskEmoji}
              </span>
              <h2 className="font-display text-xl font-extrabold text-dark mt-2">
                Media ontgrendeld! 🎉
              </h2>
              <p className="text-dark/60 text-sm font-medium">
                {media.taskName} — {media.childName}
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden bg-cream-100">
              {media.mediaType === 'video' ? (
                <video
                  src={media.mediaUrl}
                  controls
                  autoPlay
                  className="w-full max-h-80 object-contain"
                />
              ) : (
                <img
                  src={media.mediaUrl}
                  alt={media.taskName}
                  className="w-full max-h-80 object-contain"
                />
              )}
            </div>

            <button onClick={onClose} className="w-full btn-primary">
              Sluiten
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
