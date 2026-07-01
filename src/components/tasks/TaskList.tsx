'use client'

import { AnimatePresence } from 'framer-motion'
import type { ChildTheme, FamilyAssignment } from '@/lib/db'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  assignments: FamilyAssignment[]
  theme: ChildTheme
  childName: string
  title?: string
}

export function TaskList({ assignments, theme, childName, title = 'Vandaag' }: TaskListProps) {
  if (assignments.length === 0) {
    return (
      <section>
        <h3 className="section-title mb-3">{title}</h3>
        <p className="text-dark/40 font-medium text-sm">Geen taken voor vandaag 🎉</p>
      </section>
    )
  }

  return (
    <section>
      <h3 className="section-title mb-3">{title}</h3>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {assignments.map((assignment) => (
            <TaskItem
              key={assignment.id}
              assignment={assignment}
              theme={theme}
              childName={childName}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
