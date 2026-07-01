'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { DashboardTask, PendingAssignment } from '@/lib/dashboard'
import { TaskForm, taskToFormData, type TaskFormData } from '@/components/dashboard/TaskForm'

const TYPE_GROUPS: { key: string; label: string; types: string[] }[] = [
  { key: 'daily', label: 'Dagelijks', types: ['daily'] },
  { key: 'weekly', label: 'Wekelijks', types: ['weekly'] },
  { key: 'bonus', label: 'Bonus', types: ['bonus'] },
]

interface ChildOption {
  id: string
  name: string
}

export function TasksManager() {
  const [tasks, setTasks] = useState<DashboardTask[]>([])
  const [pending, setPending] = useState<PendingAssignment[]>([])
  const [children, setChildren] = useState<ChildOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [tasksRes, childrenRes] = await Promise.all([
      fetch('/api/dashboard/tasks'),
      fetch('/api/dashboard/children'),
    ])
    const tasksData = await tasksRes.json()
    const childrenData = await childrenRes.json()
    setTasks(tasksData.tasks ?? [])
    setPending(tasksData.pending ?? [])
    setChildren(
      (childrenData.children ?? []).map((c: { id: string; name: string }) => ({
        id: c.id,
        name: c.name,
      }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate(data: TaskFormData) {
    const res = await fetch('/api/dashboard/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        emoji: data.emoji,
        type: data.type,
        points: data.points,
        childIds: data.childIds,
        mediaUrl: data.type === 'bonus' ? data.mediaUrl || undefined : undefined,
        mediaType: data.type === 'bonus' ? data.mediaType : undefined,
      }),
    })
    if (!res.ok) {
      toast.error('Kon taak niet aanmaken')
      return
    }
    toast.success('Taak aangemaakt')
    setShowCreate(false)
    load()
  }

  async function handleUpdate(id: string, data: TaskFormData) {
    const res = await fetch(`/api/dashboard/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        emoji: data.emoji,
        type: data.type,
        points: data.points,
        childIds: data.childIds,
        mediaUrl: data.type === 'bonus' ? data.mediaUrl || null : null,
        mediaType: data.type === 'bonus' ? data.mediaType : null,
      }),
    })
    if (!res.ok) {
      toast.error('Kon taak niet bijwerken')
      return
    }
    toast.success('Taak bijgewerkt')
    setEditingId(null)
    load()
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Taak deactiveren?')) return
    const res = await fetch(`/api/dashboard/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Kon taak niet deactiveren')
      return
    }
    toast.success('Taak gedeactiveerd')
    load()
  }

  async function handleAssign(childId: string, taskId: string, assigned: boolean) {
    const res = await fetch('/api/dashboard/tasks/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId, taskId, assigned }),
    })
    if (!res.ok) {
      toast.error('Kon toewijzing niet wijzigen')
      load()
      return
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assignedChildIds: assigned
                ? [...t.assignedChildIds, childId]
                : t.assignedChildIds.filter((id) => id !== childId),
            }
          : t
      )
    )
  }

  async function handleUnlock(assignmentId: string) {
    const res = await fetch('/api/dashboard/tasks/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId }),
    })
    if (!res.ok) {
      toast.error('Kon taak niet ontgrendelen')
      return
    }
    toast.success('Taak ontgrendeld')
    load()
  }

  async function handleGiveBonus(childId: string, taskId: string, childName: string) {
    const res = await fetch('/api/dashboard/tasks/bonus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId, taskId }),
    })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? 'Kon bonustaak niet geven')
      return
    }
    toast.success(`Bonustaak gegeven aan ${childName}`)
    load()
  }

  function displayPoints(task: DashboardTask) {
    return task.type === 'bonus' ? `+${task.pointsReward}` : `-${task.pointsLoss}`
  }

  if (loading) {
    return <p className="text-dark/40 font-medium animate-pulse">Taken laden...</p>
  }

  return (
    <div className="space-y-8">
      {/* Sectie A: Ontgrendelen */}
      {pending.length > 0 && (
        <section>
          <h2 className="section-title mb-4">Vandaag ontgrendelen</h2>
          <div className="space-y-2">
            {pending.map((a) => (
              <div key={a.id} className="card flex items-center gap-3 p-4">
                <span className="text-2xl">{a.task.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-dark">{a.task.name}</p>
                  <p className="text-xs text-dark/50">{a.childName}</p>
                </div>
                <button
                  onClick={() => handleUnlock(a.id)}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Ontgrendelen
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sectie B: Taken beheren */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Taken beheren</h2>
          {!showCreate && !editingId && (
            <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
              + Nieuwe taak
            </button>
          )}
        </div>

        {showCreate && (
          <div className="mb-6">
            <TaskForm
              children={children}
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
              submitLabel="Taak aanmaken"
            />
          </div>
        )}

        {TYPE_GROUPS.map((group) => {
          const groupTasks = tasks.filter((t) => group.types.includes(t.type))
          if (groupTasks.length === 0) return null

          return (
            <div key={group.key} className="mb-6">
              <h3 className="font-bold text-dark/60 text-sm uppercase tracking-wide mb-3">
                {group.label}
              </h3>
              <div className="space-y-3">
                {groupTasks.map((task) =>
                  editingId === task.id ? (
                    <TaskForm
                      key={task.id}
                      initial={taskToFormData(task)}
                      children={children}
                      onSubmit={(data) => handleUpdate(task.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div key={task.id} className="card p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{task.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-dark">{task.name}</p>
                          <p className="text-xs text-dark/50">
                            {displayPoints(task)} punten
                            {task.type === 'bonus' && task.mediaUrl && ' · 🎬 media'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(task.id)}
                            className="btn-ghost text-xs px-3 py-1.5"
                          >
                            Bewerken
                          </button>
                          <button
                            onClick={() => handleDeactivate(task.id)}
                            className="text-xs px-3 py-1.5 rounded-2xl font-bold text-accent-red hover:bg-red-50"
                          >
                            Verwijderen
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1 border-t border-cream-100">
                        {children.map((child) => (
                          <div key={child.id} className="flex items-center gap-2">
                            {task.type !== 'bonus' ? (
                              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-dark">
                                <input
                                  type="checkbox"
                                  checked={task.assignedChildIds.includes(child.id)}
                                  onChange={(e) =>
                                    handleAssign(child.id, task.id, e.target.checked)
                                  }
                                  className="h-4 w-4 rounded accent-accent-orange"
                                />
                                {child.name}
                              </label>
                            ) : (
                              <>
                                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-dark">
                                  <input
                                    type="checkbox"
                                    checked={task.assignedChildIds.includes(child.id)}
                                    onChange={(e) =>
                                      handleAssign(child.id, task.id, e.target.checked)
                                    }
                                    className="h-4 w-4 rounded accent-accent-orange"
                                  />
                                  {child.name}
                                </label>
                                {task.assignedChildIds.includes(child.id) && (
                                  <button
                                    onClick={() =>
                                      handleGiveBonus(child.id, task.id, child.name)
                                    }
                                    className="btn-primary text-xs px-2 py-1"
                                  >
                                    Geef bonustaak
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
