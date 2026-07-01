'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { DashboardGoal } from '@/lib/goals'
import { GoalForm, goalToFormData, type GoalFormData } from '@/components/dashboard/GoalForm'

interface ChildOption {
  id: string
  name: string
}

function availableLabel(availableTo: string, children: ChildOption[]) {
  if (availableTo === 'all') return 'Heel het gezin'
  return children.find((c) => c.id === availableTo)?.name ?? 'Onbekend'
}

export function GoalsManager() {
  const [goals, setGoals] = useState<DashboardGoal[]>([])
  const [children, setChildren] = useState<ChildOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [goalsRes, childrenRes] = await Promise.all([
      fetch('/api/dashboard/goals'),
      fetch('/api/dashboard/children'),
    ])
    const goalsData = await goalsRes.json()
    const childrenData = await childrenRes.json()
    setGoals(goalsData.goals ?? [])
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

  async function handleCreate(data: GoalFormData) {
    const res = await fetch('/api/dashboard/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        description: data.description || undefined,
      }),
    })
    if (!res.ok) {
      toast.error('Kon doel niet aanmaken')
      return
    }
    toast.success('Spaardoel aangemaakt')
    setShowCreate(false)
    load()
  }

  async function handleUpdate(id: string, data: GoalFormData) {
    const res = await fetch(`/api/dashboard/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        description: data.description || null,
      }),
    })
    if (!res.ok) {
      toast.error('Kon doel niet bijwerken')
      return
    }
    toast.success('Doel bijgewerkt')
    setEditingId(null)
    load()
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Doel verwijderen?')) return
    const res = await fetch(`/api/dashboard/goals/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Kon doel niet verwijderen')
      return
    }
    toast.success('Doel verwijderd')
    load()
  }

  async function handleReset(id: string) {
    if (!confirm('Spaarpot leegmaken en opnieuw beginnen?')) return
    const res = await fetch(`/api/dashboard/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    })
    if (!res.ok) {
      toast.error('Kon doel niet resetten')
      return
    }
    toast.success('Spaarpot gereset')
    load()
  }

  if (loading) {
    return <p className="text-dark/40 font-medium animate-pulse">Doelen laden...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Spaardoelen</h2>
          <p className="text-sm text-dark/50 mt-1">
            Grote doelen waar kinderen naartoe sparen met hun punten
          </p>
        </div>
        {!showCreate && !editingId && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm shrink-0">
            + Nieuw doel
          </button>
        )}
      </div>

      {showCreate && (
        <GoalForm
          children={children}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          submitLabel="Doel aanmaken"
        />
      )}

      <div className="space-y-3">
        {goals.map((goal) =>
          editingId === goal.id ? (
            <GoalForm
              key={goal.id}
              initial={goalToFormData(goal)}
              children={children}
              onSubmit={(data) => handleUpdate(goal.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={goal.id} className="card p-4 space-y-3">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{goal.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-dark">{goal.name}</p>
                  <p className="text-sm text-dark/50">
                    ⭐ {goal.currentPoints} / {goal.targetPoints} punten ·{' '}
                    {availableLabel(goal.availableTo, children)}
                  </p>
                  {goal.description && (
                    <p className="text-xs text-dark/40 mt-0.5">{goal.description}</p>
                  )}
                  {goal.isCompleted && (
                    <span className="badge bg-accent-green/20 text-accent-green text-xs mt-2 inline-flex">
                      🎉 Doel bereikt!
                    </span>
                  )}
                </div>
              </div>

              <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-orange rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((goal.currentPoints / goal.targetPoints) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setEditingId(goal.id)}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  Bewerken
                </button>
                {goal.currentPoints > 0 && (
                  <button
                    onClick={() => handleReset(goal.id)}
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    Reset spaarpot
                  </button>
                )}
                <button
                  onClick={() => handleDeactivate(goal.id)}
                  className="text-xs px-3 py-1.5 rounded-2xl font-bold text-accent-red hover:bg-red-50"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          )
        )}

        {goals.length === 0 && !showCreate && (
          <p className="text-dark/40 font-medium text-sm">
            Nog geen spaardoelen. Maak er een aan, bv. een leuke uitstap!
          </p>
        )}
      </div>
    </div>
  )
}
