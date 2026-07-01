'use client'

import { useState } from 'react'
import type { DashboardPunishment } from '@/lib/punishments'

export interface PunishmentFormData {
  name: string
  emoji: string
  description: string
  pointsLoss: number
}

interface PunishmentFormProps {
  initial?: Partial<PunishmentFormData>
  onSubmit: (data: PunishmentFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function PunishmentForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Opslaan',
}: PunishmentFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '⚠️')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [pointsLoss, setPointsLoss] = useState(initial?.pointsLoss ?? 10)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        emoji,
        description: description.trim(),
        pointsLoss,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h3 className="font-display text-lg font-bold text-dark">
        {initial?.name ? 'Straf bewerken' : 'Nieuwe straf'}
      </h3>

      <div className="grid grid-cols-[4rem_1fr] gap-3">
        <div>
          <label className="text-xs font-bold text-dark/50 mb-1 block">Emoji</label>
          <input
            className="input text-center text-2xl px-2"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-dark/50 mb-1 block">Naam</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bv. Onbeleefd zijn"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-1 block">
          Puntenverlies
        </label>
        <input
          type="number"
          min={1}
          className="input"
          value={pointsLoss}
          onChange={(e) => setPointsLoss(Number(e.target.value))}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-1 block">
          Beschrijving (optioneel)
        </label>
        <input
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Extra uitleg"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Opslaan...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Annuleren
          </button>
        )}
      </div>
    </form>
  )
}

export function punishmentToFormData(punishment: DashboardPunishment): PunishmentFormData {
  return {
    name: punishment.name,
    emoji: punishment.emoji,
    description: punishment.description ?? '',
    pointsLoss: punishment.pointsLoss,
  }
}
