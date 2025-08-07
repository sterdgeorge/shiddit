'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { loginUser, registerUser } from '@/lib/auth'

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login
        await loginUser(email, password)
        onClose()
        window.location.reload()
      } else {
        // Register
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long')
          return
        }
        if (!username.trim()) {
          setError('Username is required')
          return
        }
        if (username.length < 3) {
          setError('Username must be at least 3 characters long')
          return
        }
        
        await registerUser(email, password, username)
        onClose()
        // Show success message instead of reloading
        alert('Account created successfully! Please check your email to verify your account before you can use the site.')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      
      // Handle specific Firebase Auth errors
      let errorMessage = 'Authentication failed. Please try again.'
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak'
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Log In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          By continuing, you agree to our{' '}
          <Link href="/user-agreement" className="text-blue-500 hover:text-blue-600">
            User Agreement
          </Link>
          {' '}and acknowledge that you understand the{' '}
          <Link href="/privacy" className="text-blue-500 hover:text-blue-600">
            Privacy Policy
          </Link>
        </p>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <input
                type="text"
                placeholder="Username *"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <input
              type="text"
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

          {!isLogin && (
            <div>
              <input
                type="password"
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                required={!isLogin}
              />
            </div>
          )}

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
            {isLoading ? (isLogin ? 'Logging in...' : 'Creating account...') : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {isLogin && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/forgot-password" className="text-blue-500 hover:text-blue-600">
                Forgot password?
              </Link>
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "New to Shiddit? " : "Already have an account? "}
            <button 
              onClick={toggleMode}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
} 