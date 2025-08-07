'use client'

import { useState } from 'react'
import { X, Phone, Mail } from 'lucide-react'
import { loginUser } from '@/lib/localData'

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const user = loginUser(email, password)
      if (user) {
        onClose()
        window.location.reload()
      } else {
        setError('Invalid email or password')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Log In</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          By continuing, you agree to our{' '}
          <button className="text-blue-500 hover:text-blue-600">User Agreement</button>
          {' '}and acknowledge that you understand the{' '}
          <button className="text-blue-500 hover:text-blue-600">Privacy Policy</button>
        </p>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 text-gray-900 font-medium transition-colors">
            <Phone className="w-5 h-5" />
            <span>Continue With Phone Number</span>
          </button>
          
          <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 text-gray-900 font-medium transition-colors">
            <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">G</div>
            <span>Continue with Google</span>
          </button>
          
          <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 text-gray-900 font-medium transition-colors">
            <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-xs font-bold">⌘</div>
            <span>Continue With Apple</span>
          </button>
        </div>

        {/* Separator */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email or username *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <button className="text-blue-500 hover:text-blue-600">Forgot password?</button>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            New to Shiddit?{' '}
            <button className="text-blue-500 hover:text-blue-600 font-medium">Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  )
} 