import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { LoginProvider } from '@/components/providers/LoginProvider'

export const metadata: Metadata = {
  title: 'Shiddit - Share Your Thoughts',
  description: 'A Shiddit-style platform for sharing and discussing content',
  icons: {
    icon: '/icon.jpg',
    shortcut: '/icon.jpg',
    apple: '/icon.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <AuthProvider>
            <LoginProvider>
              {children}
            </LoginProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 