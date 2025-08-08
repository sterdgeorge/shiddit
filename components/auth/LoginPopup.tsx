'use client'

import { useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { loginUser, registerUser } from '@/lib/auth'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (mode === 'login') {
        // Login
        await loginUser(email, password)
        onClose()
        window.location.reload()
      } else if (mode === 'register') {
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
      } else if (mode === 'forgot') {
        // Forgot password
        await sendPasswordResetEmail(auth, email)
        setSuccess('Password reset email sent! Check your inbox.')
        setTimeout(() => {
          setMode('login')
          setSuccess('')
        }, 3000)
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
    setSuccess('')
  }

  const setModeAndReset = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            {mode !== 'login' && (
              <button
                onClick={() => setModeAndReset('login')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Log In' : mode === 'register' ? 'Sign Up' : 'Reset Password'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {mode !== 'forgot' && (
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
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <input
                type="text"
                placeholder="Username *"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                required={mode === 'register'}
              />
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder={mode === 'forgot' ? 'Email *' : 'Email or username *'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <input
                type="password"
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                required={mode === 'login' || mode === 'register'}
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <input
                type="password"
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                required={mode === 'register'}
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading 
              ? (mode === 'login' ? 'Logging in...' : mode === 'register' ? 'Creating account...' : 'Sending...') 
              : (mode === 'login' ? 'Log In' : mode === 'register' ? 'Sign Up' : 'Send Reset Email')
            }
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {mode === 'login' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <button 
                onClick={() => setModeAndReset('forgot')}
                className="text-blue-500 hover:text-blue-600"
              >
                Forgot password?
              </button>
            </p>
          )}
          {mode === 'login' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              New to Shiddit?{' '}
              <button 
                onClick={() => setModeAndReset('register')}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Sign Up
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button 
                onClick={() => setModeAndReset('login')}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 