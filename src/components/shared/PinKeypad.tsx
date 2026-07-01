'use client'

import { useCallback, useEffect, useState } from 'react'
import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

const PIN_LENGTH = 4

interface PinKeypadProps {
  onSubmit: (pin: string) => Promise<void>
  submitLabel?: string
  loading?: boolean
  error?: boolean
  resetKey?: number | string
}

export function PinKeypad({
  onSubmit,
  submitLabel = 'Bevestigen',
  loading = false,
  error = false,
  resetKey,
}: PinKeypadProps) {
  const [pin, setPin] = useState('')

  const reset = useCallback(() => setPin(''), [])

  useEffect(() => {
    reset()
  }, [resetKey, reset])

  async function submit(enteredPin: string) {
    if (loading) return
    await onSubmit(enteredPin)
  }

  function handleDigit(digit: string) {
    if (loading || pin.length >= PIN_LENGTH) return
    const next = pin + digit
    setPin(next)
    if (next.length === PIN_LENGTH) {
      submit(next)
    }
  }

  function handleBackspace() {
    if (loading) return
    setPin((p) => p.slice(0, -1))
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-3">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 w-4 rounded-full border-2 transition-all duration-150',
              i < pin.length
                ? 'bg-accent-orange border-accent-orange scale-110'
                : 'border-cream-200 bg-cream-50',
              error && 'border-accent-red bg-accent-red/20'
            )}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-accent-red font-bold text-sm">
          Onjuiste pincode, probeer opnieuw
        </p>
      )}

      {loading && (
        <p className="text-center text-dark/40 font-medium text-sm animate-pulse">
          Controleren...
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            disabled={loading}
            className="h-14 rounded-2xl bg-cream-100 font-display text-2xl font-bold text-dark hover:bg-cream-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleDigit('0')}
          disabled={loading}
          className="h-14 rounded-2xl bg-cream-100 font-display text-2xl font-bold text-dark hover:bg-cream-200 active:scale-95 transition-all disabled:opacity-50"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          disabled={loading || pin.length === 0}
          className="h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-dark/60 hover:bg-cream-200 active:scale-95 transition-all disabled:opacity-50"
          aria-label="Verwijderen"
        >
          <Delete className="h-6 w-6" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => pin.length === PIN_LENGTH && submit(pin)}
        disabled={loading || pin.length < PIN_LENGTH}
        className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitLabel}
      </button>
    </div>
  )
}
