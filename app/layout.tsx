import './globals.css'
import type { Metadata } from 'next'
import ProvidersWrapper from '../components/ProvidersWrapper'

export const metadata: Metadata = {
  title: 'Adela in ONEderland',
  description: 'O invitație digitală premium: Adela in ONEderland'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <ProvidersWrapper>
          {children}
        </ProvidersWrapper>
      </body>
    </html>
  )
}
