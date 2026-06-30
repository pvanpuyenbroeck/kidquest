import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-6xl font-extrabold text-dark">
            KidQuest
          </h1>
          <p className="text-xl text-dark/60 font-medium">🦕 Avontuur begint met taken 🦄</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/family" className="btn-primary text-lg px-8 py-4">
            🏠 Gezinsscherm
          </Link>
          <Link href="/dashboard" className="btn-ghost text-lg px-8 py-4">
            ⚙️ Ouder Dashboard
          </Link>
        </div>

        <p className="text-sm text-dark/40">KidQuest v0.1 — Polaris Web Studio</p>
      </div>
    </main>
  )
}
