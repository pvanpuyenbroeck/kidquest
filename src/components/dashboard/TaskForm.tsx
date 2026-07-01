'use client'

import { useState } from 'react'
import type { DashboardTask, TaskType } from '@/lib/dashboard'

export interface TaskFormData {
  name: string
  emoji: string
  type: TaskType
  points: number
  childIds: string[]
  mediaUrl: string
  mediaType: string
}

interface TaskFormProps {
  initial?: Partial<TaskFormData>
  children: { id: string; name: string }[]
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

const TYPE_LABELS: Record<TaskType, string> = {
  daily: 'Dagelijks',
  weekly: 'Wekelijks',
  bonus: 'Bonus',
}

export function TaskForm({
  initial,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Opslaan',
}: TaskFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✅')
  const [type, setType] = useState<TaskType>(initial?.type ?? 'daily')
  const [points, setPoints] = useState(initial?.points ?? 5)
  const [childIds, setChildIds] = useState<string[]>(initial?.childIds ?? [])
  const [mediaUrl, setMediaUrl] = useState(initial?.mediaUrl ?? '')
  const [mediaType, setMediaType] = useState(initial?.mediaType ?? 'image')
  const [loading, setLoading] = useState(false)

  const pointsLabel =
    type === 'bonus' ? 'Beloning (punten)' : 'Boete bij niet doen (punten)'

  function toggleChild(childId: string) {
    setChildIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        emoji,
        type,
        points,
        childIds,
        mediaUrl: mediaUrl.trim(),
        mediaType,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h3 className="font-display text-lg font-bold text-dark">
        {initial?.name ? 'Taak bewerken' : 'Nieuwe taak'}
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
            placeholder="Bv. Tafel dekken"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-dark/50 mb-1 block">Type</label>
          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
          >
            {(Object.keys(TYPE_LABELS) as TaskType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-dark/50 mb-1 block">{pointsLabel}</label>
          <input
            type="number"
            min={0}
            className="input"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
        </div>
      </div>

      {type === 'bonus' && (
        <>
          <div>
            <label className="text-xs font-bold text-dark/50 mb-1 block">
              Media URL (Bunny.net) — unlock na voltooien
            </label>
            <input
              className="input"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-xs font-bold text-dark/50 mb-1 block">Media type</label>
            <select
              className="input"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
            >
              <option value="image">Afbeelding</option>
              <option value="video">Video</option>
            </select>
          </div>
        </>
      )}

      <div>
        <label className="text-xs font-bold text-dark/50 mb-2 block">
          Toewijzen aan
        </label>
        <div className="flex gap-3">
          {children.map((child) => (
            <label
              key={child.id}
              className="flex items-center gap-2 cursor-pointer font-medium text-dark"
            >
              <input
                type="checkbox"
                checked={childIds.includes(child.id)}
                onChange={() => toggleChild(child.id)}
                className="h-4 w-4 rounded accent-accent-orange"
              />
              {child.name}
            </label>
          ))}
        </div>
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

export function taskToFormData(task: DashboardTask): TaskFormData {
  return {
    name: task.name,
    emoji: task.emoji,
    type: task.type,
    points: task.type === 'bonus' ? task.pointsReward : task.pointsLoss,
    childIds: task.assignedChildIds,
    mediaUrl: task.mediaUrl ?? '',
    mediaType: task.mediaType ?? 'image',
  }
}
