'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Search, Sun, Moon, Copy, LogOut, Settings, User, Shield } from 'lucide-react'
import { logoutUser } from '@/lib/localData'
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
      await copyToClipboard('TESTTEST')
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleLogout = () => {
    try {
      logoutUser()
      setShowUserMenu(false)
      window.location.reload()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

     return (
     <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
       <div className="w-full px-4 sm:px-6 lg:px-8">
         <div className="flex justify-between items-center h-14">
           {/* Logo - Far Left */}
           <div className="flex items-center">
             <Link href="/" className="flex items-center space-x-2">
               <img 
                 src="/icon.jpg" 
                 alt="shiddit Logo" 
                 className="w-8 h-8 rounded-lg object-cover"
               />
                               <span className="text-xl font-bold text-gray-900 dark:text-white">shiddit</span>
             </Link>
           </div>

           {/* Search Bar - Center */}
           <div className="absolute left-1/2 transform -translate-x-1/2 px-4 w-[800px]">
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
               <input
                 type="text"
                 placeholder="Search Shiddit"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400"
               />
             </div>
           </div>

           {/* Right Side - Far Right */}
           <div className="flex items-center space-x-2">
                         {/* Theme Toggle */}
             <button
               onClick={toggleTheme}
               className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
             >
               {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
             </button>

             {/* Auth Buttons */}
             {user ? (
              <div className="relative">
                                 <button
                   onClick={() => setShowUserMenu(!showUserMenu)}
                   className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                 >
                   <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center relative">
                     <span className="text-white text-xs font-medium">
                       {userProfile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                     </span>
                     {isUserAdmin && (
                       <Shield className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-purple-500 bg-white rounded-full" />
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
                 <div className="flex items-center space-x-2">
                   <button
                     onClick={handleCopyCA}
                     className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm whitespace-nowrap px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                   >
                     Copy CA
                   </button>
                   <button
                     onClick={showLoginPopup}
                                           className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap text-sm"
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