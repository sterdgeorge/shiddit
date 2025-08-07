'use client'

import { useState } from 'react'
import { X, Mail, RefreshCw } from 'lucide-react'
import { sendEmailVerification } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface EmailVerificationBannerProps {
  email: string
  onClose?: () => void
}

export default function EmailVerificationBanner({ email, onClose }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleResendEmail = async () => {
    if (!auth.currentUser) return

    setIsResending(true)
    setResendMessage('')

    try {
      await sendEmailVerification(auth.currentUser)
      setResendMessage('Verification email sent! Check your inbox.')
    } catch (error: any) {
      console.error('Error sending verification email:', error)
      setResendMessage('Failed to send verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Verify your email address
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              We sent a verification link to <span className="font-medium">{email}</span>. 
              Please check your email and click the link to verify your account.
            </p>
            {resendMessage && (
              <p className={`text-sm mt-2 ${
                resendMessage.includes('Failed') 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {resendMessage}
              </p>
            )}
            <div className="mt-3 flex items-center space-x-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="inline-flex items-center px-3 py-1.5 border border-orange-300 dark:border-orange-600 text-xs font-medium rounded-md text-orange-700 dark:text-orange-300 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
              >
                I've verified my email
              </button>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-orange-400 hover:text-orange-600 dark:hover:text-orange-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
