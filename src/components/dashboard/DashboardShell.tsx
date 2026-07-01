'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardGate } from '@/components/dashboard/DashboardGate'
import { useParentAuthStore } from '@/stores/parentAuthStore'

const NAV_ITEMS = [
  { href: '/dashboard/tasks', label: '📋 Taken' },
  { href: '/dashboard/points', label: '⭐ Punten' },
  { href: '/dashboard/rewards', label: '🎁 Beloningen' },
  { href: '/dashboard/goals', label: '🎯 Doelen' },
  { href: '/dashboard/punishments', label: '⚠️ Straffen' },
  { href: '/dashboard/children', label: '👧 Kinderen' },
  { href: '/dashboard/settings', label: '⚙️ Instellingen' },
]

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()
  const logout = useParentAuthStore((s) => s.logout)

  return (
    <DashboardGate>
      <div className="min-h-screen bg-cream-100">
        <header className="bg-white border-b border-cream-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-extrabold text-dark">
                Ouder Dashboard
              </h1>
              <Link
                href="/"
                className="text-xs text-dark/40 hover:text-dark/60 font-medium"
              >
                ← KidQuest home
              </Link>
            </div>
            <button
              onClick={logout}
              className="btn-ghost text-sm px-3 py-2 flex items-center gap-1.5"
            >
              <Lock className="h-4 w-4" />
              Vergrendelen
            </button>
          </div>

          <nav className="max-w-4xl mx-auto px-4 flex gap-2 pb-3 overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-2xl font-bold text-sm transition-colors whitespace-nowrap shrink-0',
                  pathname === item.href
                    ? 'bg-accent-orange text-white'
                    : 'bg-cream-100 text-dark/60 hover:bg-cream-200'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </div>
    </DashboardGate>
  )
}
