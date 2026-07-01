'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { DashboardReward } from '@/lib/rewards'
import { RewardForm, rewardToFormData, type RewardFormData } from '@/components/dashboard/RewardForm'

interface ChildOption {
  id: string
  name: string
}

function availableLabel(availableTo: string, children: ChildOption[]) {
  if (availableTo === 'all') return 'Alle kinderen'
  return children.find((c) => c.id === availableTo)?.name ?? 'Onbekend'
}

export function RewardsManager() {
  const [rewards, setRewards] = useState<DashboardReward[]>([])
  const [children, setChildren] = useState<ChildOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [rewardsRes, childrenRes] = await Promise.all([
      fetch('/api/dashboard/rewards'),
      fetch('/api/dashboard/children'),
    ])
    const rewardsData = await rewardsRes.json()
    const childrenData = await childrenRes.json()
    setRewards(rewardsData.rewards ?? [])
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

  async function handleCreate(data: RewardFormData) {
    const res = await fetch('/api/dashboard/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        mediaUrl: data.mediaUrl || undefined,
        description: data.description || undefined,
      }),
    })
    if (!res.ok) {
      toast.error('Kon beloning niet aanmaken')
      return
    }
    toast.success('Beloning aangemaakt')
    setShowCreate(false)
    load()
  }

  async function handleUpdate(id: string, data: RewardFormData) {
    const res = await fetch(`/api/dashboard/rewards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        mediaUrl: data.mediaUrl || null,
        description: data.description || null,
      }),
    })
    if (!res.ok) {
      toast.error('Kon beloning niet bijwerken')
      return
    }
    toast.success('Beloning bijgewerkt')
    setEditingId(null)
    load()
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Beloning deactiveren?')) return
    const res = await fetch(`/api/dashboard/rewards/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Kon beloning niet deactiveren')
      return
    }
    toast.success('Beloning gedeactiveerd')
    load()
  }

  if (loading) {
    return <p className="text-dark/40 font-medium animate-pulse">Beloningen laden...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Beloningen beheren</h2>
        {!showCreate && !editingId && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            + Nieuwe beloning
          </button>
        )}
      </div>

      {showCreate && (
        <RewardForm
          children={children}
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          submitLabel="Beloning aanmaken"
        />
      )}

      <div className="space-y-3">
        {rewards.map((reward) =>
          editingId === reward.id ? (
            <RewardForm
              key={reward.id}
              initial={rewardToFormData(reward)}
              children={children}
              onSubmit={(data) => handleUpdate(reward.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={reward.id} className="card p-4 flex items-center gap-4">
              <span className="text-3xl">{reward.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark">{reward.name}</p>
                <p className="text-sm text-dark/50">
                  ⭐ {reward.pointsCost} punten ·{' '}
                  {availableLabel(reward.availableTo, children)}
                </p>
                {reward.description && (
                  <p className="text-xs text-dark/40 mt-0.5">{reward.description}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditingId(reward.id)}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => handleDeactivate(reward.id)}
                  className="text-xs px-3 py-1.5 rounded-2xl font-bold text-accent-red hover:bg-red-50"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          )
        )}

        {rewards.length === 0 && !showCreate && (
          <p className="text-dark/40 font-medium text-sm">
            Nog geen beloningen. Maak er een aan!
          </p>
        )}
      </div>
    </div>
  )
}
