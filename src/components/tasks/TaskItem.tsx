'use client'

import { motion } from 'framer-motion'
import { Check, Lock, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getChildTheme } from '@/lib/child-themes'
import { useParentAuthStore } from '@/stores/parentAuthStore'
import type { ChildTheme, FamilyAssignment } from '@/lib/db'

interface TaskItemProps {
  assignment: FamilyAssignment
  theme: ChildTheme
  childName: string
}

const statusLabels: Record<FamilyAssignment['status'], string> = {
  pending: 'Wacht op mama/papa',
  unlocked: 'Klaar om af te vinken',
  completed: 'Gedaan!',
  missed: 'Niet gedaan',
}

export function TaskItem({ assignment, theme, childName }: TaskItemProps) {
  const { task, status } = assignment
  const { isAuthenticated, requestTaskComplete } = useParentAuthStore()
  const isUnlocked = status === 'unlocked'
  const isCompleted = status === 'completed'
  const isMissed = status === 'missed'
  const isPending = status === 'pending'

  function handleClick() {
    if (!isUnlocked) return

    if (!isAuthenticated) {
      toast('Roep mama of papa! 👋', {
        description: 'Eerst de ouder-pincode invoeren.',
        duration: 3000,
      })
      requestTaskComplete({
        assignmentId: assignment.id,
        taskName: task.name,
        taskEmoji: task.emoji,
        childName,
      })
      return
    }

    requestTaskComplete({
      assignmentId: assignment.id,
      taskName: task.name,
      taskEmoji: task.emoji,
      childName,
    })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'card flex items-center gap-3 p-4',
        isCompleted && 'opacity-60',
        isMissed && 'border-2 border-accent-red/30 bg-red-50/50',
        isPending && 'opacity-70'
      )}
    >
      <span className="text-2xl shrink-0" role="img" aria-hidden="true">
        {task.emoji}
      </span>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-bold text-dark truncate',
            (isCompleted || isMissed) && 'line-through'
          )}
        >
          {task.name}
        </p>
        <p className="text-xs text-dark/50 font-medium">
          {!isAuthenticated && isUnlocked
            ? 'Roep mama of papa!'
            : statusLabels[status]}
        </p>
        {isUnlocked && (task.pointsReward > 0 || task.pointsLoss > 0) && (
          <p className="text-xs font-bold text-accent-green mt-0.5">
            +{task.type === 'bonus' ? task.pointsReward : task.pointsLoss} ⭐
          </p>
        )}
      </div>

      {isCompleted && (
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-green/20 text-accent-green">
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>
      )}

      {isMissed && (
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-red/20 text-accent-red">
          <X className="h-5 w-5" strokeWidth={3} />
        </div>
      )}

      {isPending && (
        <button
          disabled
          className="shrink-0 flex items-center gap-1.5 rounded-2xl bg-cream-200 px-3 py-2 text-xs font-bold text-dark/40 cursor-not-allowed"
        >
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Wacht</span>
        </button>
      )}

      {isUnlocked && (
        <button
          onClick={handleClick}
          className={cn(
            'shrink-0 rounded-2xl px-5 py-2.5 text-sm md:text-base font-bold text-white shadow-md active:scale-95 transition-transform touch-target',
            !isAuthenticated && 'opacity-80',
            getChildTheme(theme).button
          )}
        >
          ✓ Klaar
        </button>
      )}
    </motion.div>
  )
}
