'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  CHILD_THEME_LIST,
  getChildTheme,
  type ChildTheme,
} from '@/lib/child-themes'
import { ThemeAvatar } from '@/components/shared/ThemeAvatar'

export interface ChildFormData {
  name: string
  theme: ChildTheme
  avatarEmoji: string
}

interface ChildFormProps {
  initial?: Partial<ChildFormData>
  onSubmit: (data: ChildFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

const EMOJI_SUGGESTIONS = ['🦄', '🦕', '🐉', '🦖', '🐬', '🌅', '🍓', '☀️', '🦋', '🌈', '⭐', '🐱', '🐶', '🦊', '🐰']

export function ChildForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Opslaan',
}: ChildFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [theme, setTheme] = useState<ChildTheme>(initial?.theme ?? 'unicorn')
  const [avatarEmoji, setAvatarEmoji] = useState(initial?.avatarEmoji ?? '🦄')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await onSubmit({ name: name.trim(), theme, avatarEmoji })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h3 className="font-display text-lg font-bold text-dark">
        {initial?.name ? 'Kind bewerken' : 'Nieuw kind'}
      </h3>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-1 block">Naam</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bv. Aline"
          required
        />
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-2 block">Kleur</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CHILD_THEME_LIST.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setTheme(opt.id)
                if (!initial?.name) setAvatarEmoji(opt.emoji)
              }}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-2xl p-2 border-2 transition-all',
                theme === opt.id
                  ? 'border-transparent ring-2 ring-offset-2 ring-dark/20'
                  : 'border-cream-200 bg-cream-50 hover:bg-cream-100'
              )}
            >
              <span
                className={cn('h-10 w-10 rounded-full shadow-sm ring-2 ring-white', opt.swatch)}
                style={{ backgroundColor: opt.color }}
                aria-hidden
              />
              <span className="text-[10px] font-bold text-dark/70 text-center leading-tight">
                {opt.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-2 block">Voorbeeld</label>
        <div className="flex items-center gap-3 rounded-2xl bg-cream-50 p-3">
          <ThemeAvatar emoji={avatarEmoji} theme={theme} size="md" />
          <div>
            <p className="font-bold text-dark">{name.trim() || 'Naam'}</p>
            <p className="text-xs text-dark/50">{getChildTheme(theme).label}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-dark/50 mb-1 block">Avatar emoji</label>
        <div className="flex items-center gap-3">
          <input
            className="input text-center text-2xl w-20 px-2"
            value={avatarEmoji}
            onChange={(e) => setAvatarEmoji(e.target.value)}
            maxLength={4}
          />
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_SUGGESTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatarEmoji(emoji)}
                className={cn(
                  'h-9 w-9 rounded-xl text-lg transition-colors',
                  avatarEmoji === emoji ? 'bg-accent-orange/20' : 'hover:bg-cream-100'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
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

export function childToFormData(child: {
  name: string
  theme: string
  avatarEmoji: string
}): ChildFormData {
  const config = getChildTheme(child.theme)
  return {
    name: child.name,
    theme: config.id,
    avatarEmoji: child.avatarEmoji,
  }
}
