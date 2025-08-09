'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Search, Sun, Moon, Copy, LogOut, Settings, User, Shield, Crown } from 'lucide-react'
import { logoutUser } from '@/lib/auth'
import { copyToClipboard } from '@/lib/utils'
import { useLogin } from '@/components/providers/LoginProvider'

export default function Navbar() {
  const { user, userProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { showLoginPopup } = useLogin()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const isUserAdmin = userProfile?.isAdmin || false

  const handleCopyCA = async () => {
    try {
      await copyToClipboard('FKZk9kjkEWchbcs3gBkGNvCbiyJJ6kPySSDzJqe6pump')
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      setShowUserMenu(false)
      // No need to reload the page - Firebase Auth will handle the state change
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-14">
          {/* Logo - Far Left */}
          <div className="flex items-center flex-shrink-0 z-10">
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <img 
                src="/icon.jpg" 
                alt="shiddit Logo" 
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-lg object-cover"
              />
              <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white hidden sm:block">shiddit</span>
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-2 sm:mx-4 relative z-0">
            <div className="relative w-full">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search Shiddit"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 sm:pl-9 pr-2 sm:pr-3 py-1 sm:py-1.5 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Side - Far Right */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-2 flex-shrink-0 z-10">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 sm:p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {theme === 'light' ? <Moon className="w-3 h-3 sm:w-4 sm:h-4" /> : <Sun className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>

            {/* Copy CA Button - Always visible */}
            <button
              onClick={handleCopyCA}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-xs sm:text-sm whitespace-nowrap px-1 sm:px-1.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Copy CA
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center relative overflow-hidden">
                    {userProfile?.profilePicture ? (
                      <img 
                        src={userProfile.profilePicture} 
                        alt={userProfile.username} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-medium">
                        {userProfile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                    {isUserAdmin && (
                      <Shield className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 text-purple-500 bg-white rounded-full" />
                    )}
                    {userProfile?.isPremium && (
                      <Crown className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 text-blue-500 bg-white rounded-full" />
                    )}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    <Link
                      href={`/user/${userProfile?.username}`}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    {isUserAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  onClick={showLoginPopup}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-colors whitespace-nowrap text-xs sm:text-sm"
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 