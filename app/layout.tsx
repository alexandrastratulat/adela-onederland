import './globals.css'
import type { Metadata } from 'next'
import { SceneProvider } from '../contexts/SceneContext'

export const metadata: Metadata = {
  title: 'Adela in ONEderland',
  description: 'O invitație digitală premium: Adela in ONEderland'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <SceneProvider>
          {children}
        </SceneProvider>
      </body>
    </html>
  )
}
