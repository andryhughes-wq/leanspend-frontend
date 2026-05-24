import type { Metadata } from 'next'
import { Providers } from '@/components/layout/Providers'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeanSpend 💪 — Eat Lean. Spend Less. Live Fit.',
  description: 'Fitness-focused grocery budgeting with AI meal planning, live store deals, and nutrition tracking.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                borderRadius: '14px',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#6BCB77', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#FF6B6B', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
