'use client'

import { cn } from '@/lib/utils'

interface PointsBadgeProps {
  points: number
  className?: string
}

export function PointsBadge({ points, className }: PointsBadgeProps) {
  return (
    <div
      className={cn(
        'badge-points text-lg px-4 py-2 animate-star-pop',
        className
      )}
    >
      <span role="img" aria-hidden="true">⭐</span>
      <span className="font-display text-xl">{points}</span>
      <span className="text-sm font-semibold opacity-70">punten</span>
    </div>
  )
}
