'use client'

import { useState } from 'react'
import type { DashboardGoal } from '@/lib/goals'

export interface GoalFormData {
  name: string
  emoji: string
  description: string
  targetPoints: number
  availableTo: string
}

interface GoalFormProps {
  initial?: Partial<GoalFormData>
  children: { id: string; name: string }[]
  onSubmit: (data: GoalFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function GoalForm({
  initial,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Opslaan',
}: GoalFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [targetPoints, setTargetPoints] = useState(initial?.targetPoints ?? 200)
  const [availableTo, setAvailableTo] = useState(initial?.availableTo ?? 'all')
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
        targetPoints,
        availableTo,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h3 className="font-display text-lg font-bold text-dark">
        {initial?.name ? 'Doel bewerken' : 'Nieuw spaardoel'}
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
            placeholder="Bv. Uitstap naar de dierentuin"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-1 block">
          Streefbedrag (punten)
        </label>
        <input
          type="number"
          min={10}
          className="input"
          value={targetPoints}
          onChange={(e) => setTargetPoints(Number(e.target.value))}
        />
        <p className="text-xs text-dark/40 mt-1">
          Kinderen sparen hier naartoe met punten van bonustaken
        </p>
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-1 block">
          Beschrijving (optioneel)
        </label>
        <input
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Bv. Zaterdag naar Plopsaland!"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-1 block">
          Voor wie
        </label>
        <select
          className="input"
          value={availableTo}
          onChange={(e) => setAvailableTo(e.target.value)}
        >
          <option value="all">Heel het gezin (samen sparen)</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              Alleen {child.name}
            </option>
          ))}
        </select>
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

export function goalToFormData(goal: DashboardGoal): GoalFormData {
  return {
    name: goal.name,
    emoji: goal.emoji,
    description: goal.description ?? '',
    targetPoints: goal.targetPoints,
    availableTo: goal.availableTo,
  }
}
