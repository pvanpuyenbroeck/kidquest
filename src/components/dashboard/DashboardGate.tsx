'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PinKeypad } from '@/components/shared/PinKeypad'
import { useParentAuthStore } from '@/stores/parentAuthStore'

interface DashboardGateProps {
  children: React.ReactNode
}

export function DashboardGate({ children }: DashboardGateProps) {
  const { isAuthenticated, setAuthenticated, checkSession } = useParentAuthStore()
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    checkSession().finally(() => setChecking(false))
  }, [checkSession])

  const handleSubmit = useCallback(
    async (pin: string) => {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        })

        if (!res.ok) {
          setError(true)
          setLoading(false)
          setResetKey((k) => k + 1)
          return
        }

        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        if (!sessionData.authenticated) {
          setError(true)
          setLoading(false)
          setResetKey((k) => k + 1)
          return
        }

        setAuthenticated(true)
        setError(false)
        setLoading(false)
      } catch {
        setError(true)
        setLoading(false)
        setResetKey((k) => k + 1)
      }
    },
    [setAuthenticated]
  )

  if (checking) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <p className="text-dark/40 font-medium animate-pulse">Laden...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
        <div
          className={cn(
            'card w-full max-w-sm p-8 space-y-6',
            error && 'animate-shake'
          )}
        >
          <div className="text-center space-y-2">
            <span className="text-5xl" role="img" aria-hidden="true">
              🔒
            </span>
            <h1 className="font-display text-2xl font-extrabold text-dark">
              Ouder Dashboard
            </h1>
            <p className="text-dark/60 font-medium text-sm">
              Voer je pincode in om het dashboard te openen
            </p>
          </div>

          <PinKeypad
            onSubmit={handleSubmit}
            submitLabel="Dashboard openen"
            loading={loading}
            error={error}
            resetKey={resetKey}
          />

          <Link
            href="/"
            className="block text-center text-sm text-dark/30 hover:text-dark/60 font-medium"
          >
            ← Terug naar start
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
