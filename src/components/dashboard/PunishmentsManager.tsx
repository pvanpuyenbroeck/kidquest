'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { DashboardPunishment } from '@/lib/punishments'
import {
  PunishmentForm,
  punishmentToFormData,
  type PunishmentFormData,
} from '@/components/dashboard/PunishmentForm'
import { ThemeAvatar } from '@/components/shared/ThemeAvatar'
import type { ChildTheme } from '@/lib/db'

interface ChildOption {
  id: string
  name: string
  theme: string
  avatarEmoji: string
}

export function PunishmentsManager() {
  const [punishments, setPunishments] = useState<DashboardPunishment[]>([])
  const [children, setChildren] = useState<ChildOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [closingDay, setClosingDay] = useState(false)

  const load = useCallback(async () => {
    const [punishmentsRes, childrenRes] = await Promise.all([
      fetch('/api/dashboard/punishments'),
      fetch('/api/dashboard/children'),
    ])
    const punishmentsData = await punishmentsRes.json()
    const childrenData = await childrenRes.json()
    setPunishments(punishmentsData.punishments ?? [])
    setChildren(
      (childrenData.children ?? []).map(
        (c: { id: string; name: string; theme: string; avatarEmoji: string }) => ({
          id: c.id,
          name: c.name,
          theme: c.theme,
          avatarEmoji: c.avatarEmoji,
        })
      )
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate(data: PunishmentFormData) {
    const res = await fetch('/api/dashboard/punishments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        description: data.description || undefined,
      }),
    })
    if (!res.ok) {
      toast.error('Kon straf niet aanmaken')
      return
    }
    toast.success('Straf aangemaakt')
    setShowCreate(false)
    load()
  }

  async function handleUpdate(id: string, data: PunishmentFormData) {
    const res = await fetch(`/api/dashboard/punishments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        description: data.description || null,
      }),
    })
    if (!res.ok) {
      toast.error('Kon straf niet bijwerken')
      return
    }
    toast.success('Straf bijgewerkt')
    setEditingId(null)
    load()
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Straf verwijderen?')) return
    const res = await fetch(`/api/dashboard/punishments/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Kon straf niet verwijderen')
      return
    }
    toast.success('Straf verwijderd')
    load()
  }

  async function handleGive(childId: string, punishmentId: string) {
    const res = await fetch('/api/dashboard/punishments/give', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId,
        punishmentId,
        reason: reasons[childId] || undefined,
      }),
    })
    if (!res.ok) {
      toast.error('Kon straf niet geven')
      return
    }
    const data = await res.json()
    toast.success(
      `${data.childName}: -${data.pointsLost} punten (${data.punishmentName})`
    )
    setReasons((prev) => ({ ...prev, [childId]: '' }))
    load()
  }

  async function handleDayClose() {
    if (!confirm('Dag nu afsluiten? Niet-afgevinkte taken worden bestraft.')) return
    setClosingDay(true)
    try {
      const res = await fetch('/api/dashboard/day-close', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error('Kon dag niet afsluiten')
        return
      }
      if (data.processed === 0) {
        toast.info('Geen openstaande taken om af te sluiten')
      } else {
        toast.success(
          `${data.processed} ta(a)k(en) afgesloten, ${data.missed.length} met puntenaftrek`
        )
      }
      load()
    } finally {
      setClosingDay(false)
    }
  }

  if (loading) {
    return <p className="text-dark/40 font-medium animate-pulse">Straffen laden...</p>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">Straffen beheren</h2>
          <p className="text-sm text-dark/50 mt-1">
            Voorinstellingen voor gedragsstraffen + automatische dag-afhandeling
          </p>
        </div>
        {!showCreate && !editingId && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm shrink-0">
            + Nieuwe straf
          </button>
        )}
      </div>

      {/* Dag afsluiten */}
      <div className="card p-4 bg-cream-50 border-2 border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-dark">Dag afsluiten</p>
          <p className="text-sm text-dark/50">
            Markeer niet-afgevinkte taken als gemist en trek punten af. Gebeurt ook
            automatisch na 20:00.
          </p>
        </div>
        <button
          onClick={handleDayClose}
          disabled={closingDay}
          className="btn-ghost text-sm shrink-0 border border-cream-300"
        >
          {closingDay ? 'Bezig...' : '🌙 Dag nu afsluiten'}
        </button>
      </div>

      {showCreate && (
        <PunishmentForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          submitLabel="Straf aanmaken"
        />
      )}

      {/* Voorinstellingen */}
      <div className="space-y-3">
        <h3 className="font-bold text-dark/60 text-sm uppercase tracking-wide">
          Voorinstellingen
        </h3>
        {punishments.map((punishment) =>
          editingId === punishment.id ? (
            <PunishmentForm
              key={punishment.id}
              initial={punishmentToFormData(punishment)}
              onSubmit={(data) => handleUpdate(punishment.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={punishment.id} className="card p-4 flex items-center gap-4">
              <span className="text-3xl">{punishment.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark">{punishment.name}</p>
                <p className="text-sm text-accent-red font-bold">
                  -{punishment.pointsLoss} punten
                </p>
                {punishment.description && (
                  <p className="text-xs text-dark/40 mt-0.5">{punishment.description}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditingId(punishment.id)}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => handleDeactivate(punishment.id)}
                  className="text-xs px-3 py-1.5 rounded-2xl font-bold text-accent-red hover:bg-red-50"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          )
        )}

        {punishments.length === 0 && !showCreate && (
          <p className="text-dark/40 font-medium text-sm">
            Nog geen straffen. Maak er een aan!
          </p>
        )}
      </div>

      {/* Straf geven per kind */}
      {punishments.length > 0 && children.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-dark/60 text-sm uppercase tracking-wide">
            Straf geven
          </h3>
          {children.map((child) => {
            const theme = child.theme as ChildTheme
            return (
              <div key={child.id} className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <ThemeAvatar emoji={child.avatarEmoji} theme={theme} size="md" />
                  <p className="font-bold text-dark">{child.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {punishments.map((punishment) => (
                    <button
                      key={punishment.id}
                      onClick={() => handleGive(child.id, punishment.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-bold transition-colors',
                        'bg-accent-red/10 text-accent-red hover:bg-accent-red/20'
                      )}
                    >
                      <span>{punishment.emoji}</span>
                      <span>{punishment.name}</span>
                      <span className="text-xs opacity-70">-{punishment.pointsLoss}</span>
                    </button>
                  ))}
                </div>
                <input
                  className="input text-sm"
                  placeholder="Optionele reden..."
                  value={reasons[child.id] ?? ''}
                  onChange={(e) =>
                    setReasons((prev) => ({ ...prev, [child.id]: e.target.value }))
                  }
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
