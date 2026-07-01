'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { ChildTheme } from '@/lib/db'
import { getChildTheme } from '@/lib/child-themes'
import { ThemeAvatar } from '@/components/shared/ThemeAvatar'
import { PointsBadge } from '@/components/shared/PointsBadge'
import { ChildForm, childToFormData, type ChildFormData } from '@/components/dashboard/ChildForm'

interface ManagedChild {
  id: string
  name: string
  theme: string
  avatarEmoji: string
  points: number
}

function ChildCard({
  child,
  onEdit,
  onDeactivate,
}: {
  child: ManagedChild
  onEdit: () => void
  onDeactivate: () => void
}) {
  const themeConfig = getChildTheme(child.theme)

  return (
    <div
      className={cn('card p-4 flex items-center gap-4 border-2', themeConfig.border)}
      style={{ borderColor: themeConfig.color }}
    >
      <ThemeAvatar emoji={child.avatarEmoji} theme={child.theme as ChildTheme} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: themeConfig.color }}
            aria-hidden
          />
          <p className="font-display text-lg font-extrabold text-dark">{child.name}</p>
        </div>
        <p className="text-xs text-dark/50 mt-0.5">{themeConfig.label}</p>
        <PointsBadge points={child.points} className="mt-1" />
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={onEdit} className="btn-ghost text-xs px-3 py-1.5">
          Bewerken
        </button>
        <button
          onClick={onDeactivate}
          className="text-xs px-3 py-1.5 rounded-2xl font-bold text-accent-red hover:bg-red-50"
        >
          Verwijderen
        </button>
      </div>
    </div>
  )
}

export function ChildrenManager() {
  const [children, setChildren] = useState<ManagedChild[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/dashboard/children')
    const data = await res.json()
    setChildren(data.children ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate(data: ChildFormData) {
    const res = await fetch('/api/dashboard/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      toast.error('Kon kind niet aanmaken')
      return
    }
    toast.success('Kind toegevoegd')
    setShowCreate(false)
    load()
  }

  async function handleUpdate(id: string, data: ChildFormData) {
    const res = await fetch(`/api/dashboard/children/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      toast.error('Kon kind niet bijwerken')
      return
    }
    toast.success('Profiel bijgewerkt')
    setEditingId(null)
    load()
  }

  async function handleDeactivate(id: string, name: string) {
    if (
      !confirm(
        `${name} verwijderen? Het profiel verdwijnt van het gezinsscherm. Punten en geschiedenis blijven bewaard.`
      )
    )
      return
    const res = await fetch(`/api/dashboard/children/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Kon kind niet verwijderen')
      return
    }
    toast.success(`${name} verwijderd`)
    load()
  }

  if (loading) {
    return <p className="text-dark/40 font-medium animate-pulse">Kinderen laden...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Kinderen</h2>
          <p className="text-sm text-dark/50 mt-1">
            Profielen, thema&apos;s en avatars beheren
          </p>
        </div>
        {!showCreate && !editingId && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm shrink-0">
            + Kind toevoegen
          </button>
        )}
      </div>

      {showCreate && (
        <ChildForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          submitLabel="Kind toevoegen"
        />
      )}

      <div className="space-y-3">
        {children.map((child) =>
          editingId === child.id ? (
            <ChildForm
              key={child.id}
              initial={childToFormData(child)}
              onSubmit={(data) => handleUpdate(child.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ChildCard
              key={child.id}
              child={child}
              onEdit={() => setEditingId(child.id)}
              onDeactivate={() => handleDeactivate(child.id, child.name)}
            />
          )
        )}

        {children.length === 0 && !showCreate && (
          <p className="text-dark/40 font-medium text-sm">
            Nog geen kinderen. Voeg er een toe!
          </p>
        )}
      </div>
    </div>
  )
}
