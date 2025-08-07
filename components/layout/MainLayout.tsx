'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import PopularCommunities from './PopularCommunities'
import Footer from './Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import LoginPopup from '@/components/auth/LoginPopup'
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { loading, user, isEmailVerified } = useAuth()
  const { isLoginOpen, hideLoginPopup } = useLogin()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

    return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1b] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex justify-center">
          <main className="w-full max-w-2xl p-4 pt-2">
            {user && !isEmailVerified && (
              <EmailVerificationBanner email={user.email || ''} />
            )}
            {children}
          </main>
        </div>
        <div className="w-80 p-4 hidden lg:block fixed top-12" style={{ left: 'calc(50% + 336px)' }}>
          <PopularCommunities />
        </div>
        <div className="w-80 p-4 hidden lg:block fixed bottom-4" style={{ left: 'calc(50% + 336px)' }}>
          <Footer />
        </div>
      </div>
      <LoginPopup isOpen={isLoginOpen} onClose={hideLoginPopup} />
    </div>
  )
} 