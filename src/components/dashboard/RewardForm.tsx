'use client'

import { useState } from 'react'
import type { DashboardReward } from '@/lib/rewards'

export interface RewardFormData {
  name: string
  emoji: string
  description: string
  pointsCost: number
  mediaUrl: string
  availableTo: string
}

interface RewardFormProps {
  initial?: Partial<RewardFormData>
  children: { id: string; name: string }[]
  onSubmit: (data: RewardFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function RewardForm({
  initial,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Opslaan',
}: RewardFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎁')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [pointsCost, setPointsCost] = useState(initial?.pointsCost ?? 20)
  const [mediaUrl, setMediaUrl] = useState(initial?.mediaUrl ?? '')
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
        pointsCost,
        mediaUrl: mediaUrl.trim(),
        availableTo,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h3 className="font-display text-lg font-bold text-dark">
        {initial?.name ? 'Beloning bewerken' : 'Nieuwe beloning'}
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
            placeholder="Bv. 30 min schermtijd"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-1 block">
          Puntenkosten
        </label>
        <input
          type="number"
          min={1}
          className="input"
          value={pointsCost}
          onChange={(e) => setPointsCost(Number(e.target.value))}
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
          placeholder="Extra uitleg voor ouders"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-1 block">
          Media URL (optioneel, Bunny.net)
        </label>
        <input
          className="input"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-1 block">
          Beschikbaar voor
        </label>
        <select
          className="input"
          value={availableTo}
          onChange={(e) => setAvailableTo(e.target.value)}
        >
          <option value="all">Alle kinderen</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
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

export function rewardToFormData(reward: DashboardReward): RewardFormData {
  return {
    name: reward.name,
    emoji: reward.emoji,
    description: reward.description ?? '',
    pointsCost: reward.pointsCost,
    mediaUrl: reward.mediaUrl ?? '',
    availableTo: reward.availableTo,
  }
}
