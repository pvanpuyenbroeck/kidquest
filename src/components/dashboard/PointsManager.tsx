'use client'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getChildTheme } from '@/lib/child-themes'
import type { ChildWithHistory } from '@/lib/dashboard'
import { ThemeAvatar } from '@/components/shared/ThemeAvatar'
import { PointsBadge } from '@/components/shared/PointsBadge'

export function PointsManager() {
  const [children, setChildren] = useState<ChildWithHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState<
    Record<string, { addAmount: string; addReason: string; subAmount: string; subReason: string }>
  >({})

  const load = useCallback(async () => {
    const res = await fetch('/api/dashboard/children')
    const data = await res.json()
    setChildren(data.children ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function getForm(childId: string) {
    return (
      forms[childId] ?? {
        addAmount: '',
        addReason: '',
        subAmount: '',
        subReason: '',
      }
    )
  }

  function updateForm(childId: string, patch: Partial<ReturnType<typeof getForm>>) {
    setForms((prev) => ({
      ...prev,
      [childId]: { ...getForm(childId), ...patch },
    }))
  }

  async function adjustPoints(childId: string, delta: number, reason: string) {
    const res = await fetch(`/api/dashboard/children/${childId}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta, reason }),
    })
    if (!res.ok) {
      toast.error('Kon punten niet aanpassen')
      return
    }
    const data = await res.json()
    toast.success(
      delta > 0
        ? `+${delta} punten toegekend`
        : `${Math.abs(delta)} punten afgetrokken`
    )
    setChildren((prev) =>
      prev.map((c) =>
        c.id === childId ? { ...c, points: data.newPoints } : c
      )
    )
    updateForm(childId, { addAmount: '', addReason: '', subAmount: '', subReason: '' })
    load()
  }

  if (loading) {
    return <p className="text-dark/40 font-medium animate-pulse">Kinderen laden...</p>
  }

  return (
    <div className="space-y-6">
      <h2 className="section-title">Punten beheren</h2>

      {children.map((child) => {
        const form = getForm(child.id)
        const themeConfig = getChildTheme(child.theme)

        return (
          <div
            key={child.id}
            className={cn('card border-2 p-5 space-y-5 bg-gradient-to-br', themeConfig.header)}
          >
            <div className="flex items-center gap-4">
              <ThemeAvatar emoji={child.avatarEmoji} theme={child.theme} size="md" />
              <div>
                <h3 className="font-display text-xl font-extrabold text-dark">
                  {child.name}
                </h3>
                <PointsBadge points={child.points} className="mt-1" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Toekennen */}
              <div className="bg-white/70 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-accent-green text-sm">Punten toekennen</h4>
                <input
                  type="number"
                  min={1}
                  placeholder="Bedrag"
                  className="input"
                  value={form.addAmount}
                  onChange={(e) => updateForm(child.id, { addAmount: e.target.value })}
                />
                <input
                  placeholder="Reden (bv. Extra geholpen)"
                  className="input"
                  value={form.addReason}
                  onChange={(e) => updateForm(child.id, { addReason: e.target.value })}
                />
                <button
                  onClick={() => {
                    const amount = Number(form.addAmount)
                    if (!amount || !form.addReason.trim()) {
                      toast.error('Vul bedrag en reden in')
                      return
                    }
                    adjustPoints(child.id, amount, form.addReason.trim())
                  }}
                  className={cn('w-full text-sm', themeConfig.button)}
                >
                  Toekennen
                </button>
              </div>

              {/* Aftrekken */}
              <div className="bg-white/70 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-accent-red text-sm">Punten aftrekken</h4>
                <input
                  type="number"
                  min={1}
                  placeholder="Bedrag"
                  className="input"
                  value={form.subAmount}
                  onChange={(e) => updateForm(child.id, { subAmount: e.target.value })}
                />
                <input
                  placeholder="Reden (bv. Ruzie gemaakt)"
                  className="input"
                  value={form.subReason}
                  onChange={(e) => updateForm(child.id, { subReason: e.target.value })}
                />
                <button
                  onClick={() => {
                    const amount = Number(form.subAmount)
                    if (!amount || !form.subReason.trim()) {
                      toast.error('Vul bedrag en reden in')
                      return
                    }
                    adjustPoints(child.id, -amount, form.subReason.trim())
                  }}
                  className="w-full text-sm rounded-2xl font-bold px-5 py-3 bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
                >
                  Aftrekken
                </button>
              </div>
            </div>

            {/* Geschiedenis */}
            {child.history.length > 0 && (
              <div>
                <h4 className="font-bold text-dark/50 text-xs uppercase tracking-wide mb-2">
                  Geschiedenis
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {child.history.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between text-sm bg-white/50 rounded-xl px-3 py-2"
                    >
                      <span className="text-dark/70 truncate flex-1 mr-2">
                        {entry.reason}
                      </span>
                      <span
                        className={cn(
                          'font-bold shrink-0',
                          entry.delta > 0 ? 'text-accent-green' : entry.delta < 0 ? 'text-accent-red' : 'text-dark/40'
                        )}
                      >
                        {entry.delta > 0 ? '+' : ''}
                        {entry.delta !== 0 ? entry.delta : '—'}
                      </span>
                      <span className="text-dark/30 text-xs ml-2 shrink-0">
                        {format(new Date(entry.createdAt), 'd MMM', { locale: nl })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
