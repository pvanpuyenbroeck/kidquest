'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { DashboardSettings } from '@/lib/settings'

export function SettingsManager() {
  const [settings, setSettings] = useState<DashboardSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [familyName, setFamilyName] = useState('')
  const [dayCloseHour, setDayCloseHour] = useState(20)
  const [dailyStartPoints, setDailyStartPoints] = useState(10)
  const [savingGeneral, setSavingGeneral] = useState(false)

  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [savingPin, setSavingPin] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/dashboard/settings')
    const data = await res.json()
    if (data.settings) {
      setSettings(data.settings)
      setFamilyName(data.settings.familyName)
      setDayCloseHour(data.settings.dayCloseHour)
      setDailyStartPoints(data.settings.dailyStartPoints)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSaveGeneral(e: React.FormEvent) {
    e.preventDefault()
    setSavingGeneral(true)
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName, dayCloseHour, dailyStartPoints }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Kon instellingen niet opslaan')
        return
      }
      setSettings(data)
      toast.success('Instellingen opgeslagen')
    } finally {
      setSavingGeneral(false)
    }
  }

  async function handleSavePin(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{4}$/.test(newPin)) {
      toast.error('Pincode moet uit 4 cijfers bestaan')
      return
    }
    if (newPin !== confirmPin) {
      toast.error('Pincodes komen niet overeen')
      return
    }
    setSavingPin(true)
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Kon pincode niet wijzigen')
        return
      }
      setSettings(data)
      setNewPin('')
      setConfirmPin('')
      toast.success('Pincode gewijzigd')
    } finally {
      setSavingPin(false)
    }
  }

  if (loading) {
    return <p className="text-dark/40 font-medium animate-pulse">Instellingen laden...</p>
  }

  return (
    <div className="space-y-6">
      <h2 className="section-title">Instellingen</h2>

      {/* Algemeen */}
      <form onSubmit={handleSaveGeneral} className="card space-y-4 p-5">
        <h3 className="font-display text-lg font-bold text-dark">Algemeen</h3>

        <div>
          <label className="text-xs font-bold text-dark/50 mb-1 block">Gezinsnaam</label>
          <input
            className="input"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Bv. Familie Van Puyenbroeck"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-dark/50 mb-1 block">
            Dag automatisch afsluiten om
          </label>
          <select
            className="input"
            value={dayCloseHour}
            onChange={(e) => setDayCloseHour(Number(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00 uur
              </option>
            ))}
          </select>
          <p className="text-xs text-dark/40 mt-1">
            Niet-afgevinkte dagtaken worden vanaf dit uur als gemist gemarkeerd (met
            puntenaftrek).
          </p>
        </div>

        <div>
          <label className="text-xs font-bold text-dark/50 mb-1 block">
            Startpunten per dag
          </label>
          <input
            type="number"
            min={0}
            max={999}
            className="input w-32"
            value={dailyStartPoints}
            onChange={(e) => setDailyStartPoints(Number(e.target.value))}
            required
          />
          <p className="text-xs text-dark/40 mt-1">
            Elk kind begint elke nieuwe dag met dit aantal punten. Spaardoelen blijven
            behouden.
          </p>
        </div>

        <button type="submit" disabled={savingGeneral} className="btn-primary">
          {savingGeneral ? 'Opslaan...' : 'Opslaan'}
        </button>
      </form>

      {/* Pincode */}
      <form onSubmit={handleSavePin} className="card space-y-4 p-5">
        <div>
          <h3 className="font-display text-lg font-bold text-dark">Ouder-pincode</h3>
          <p className="text-sm text-dark/50 mt-0.5">
            {settings?.hasCustomPin
              ? 'Er is een eigen pincode ingesteld.'
              : 'Standaardpincode (1234) is nog actief.'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-dark/50 mb-1 block">
              Nieuwe pincode
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              className="input text-center tracking-[0.5em] text-lg"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-dark/50 mb-1 block">
              Bevestig pincode
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              className="input text-center tracking-[0.5em] text-lg"
              value={confirmPin}
              onChange={(e) =>
                setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))
              }
              placeholder="••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingPin || newPin.length !== 4}
          className="btn-primary"
        >
          {savingPin ? 'Wijzigen...' : 'Pincode wijzigen'}
        </button>
      </form>
    </div>
  )
}
