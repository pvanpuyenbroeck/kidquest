import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'KidQuest 🦕🦄',
  description: 'Gezinstaak app voor avontuurlijke kinderen',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF7F0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Baloo+2:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream-100 antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '1rem',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: '600',
            },
          }}
        />
      </body>
    </html>
  )
}
