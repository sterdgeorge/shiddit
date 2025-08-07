'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import EmailVerificationBanner from './EmailVerificationBanner'

interface RequireVerificationProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function RequireVerification({ children, fallback }: RequireVerificationProps) {
  const { user, isEmailVerified } = useAuth()

  // If user is not logged in, show children (let login handle it)
  if (!user) {
    return <>{children}</>
  }

  // If user is not verified, show verification banner and fallback
  if (!isEmailVerified) {
    return (
      <div>
        <EmailVerificationBanner email={user.email || ''} />
        {fallback || (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Email Verification Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please verify your email address to access this feature.
            </p>
          </div>
        )}
      </div>
    )
  }

  // If user is verified, show children
  return <>{children}</>
}
