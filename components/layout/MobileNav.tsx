'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { 
  Home, 
  Trophy, 
  Users, 
  Crown, 
  Settings, 
  User, 
  Hash, 
  Shield, 
  Zap, 
  Star, 
  ArrowLeftRight, 
  Rocket, 
  Coins,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MobileNav() {
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  const navigationItems = [
    {
      name: 'Feed',
      href: '/',
      icon: Home,
      requiresAuth: false,
    },
    {
      name: 'Leaderboard',
      href: '/leaderboard',
      icon: Trophy,
      requiresAuth: false,
    },
    {
      name: 'Communities',
      href: '/communities',
      icon: Users,
      requiresAuth: false,
    },
    {
      name: 'Premium',
      href: '/premium',
      icon: Crown,
      requiresAuth: false,
    },
    {
      name: 'Swap',
      href: '/swap',
      icon: ArrowLeftRight,
      requiresAuth: false,
    },
    {
      name: 'Launcher',
      href: '/launcher',
      icon: Rocket,
      requiresAuth: false,
    },
  ]

  const userItems = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      requiresAuth: true,
    },
    {
      name: 'Profile',
      href: `/user/${userProfile?.username || 'profile'}`,
      icon: User,
      requiresAuth: true,
    },
    {
      name: 'Create Post',
      href: '/create-post',
      icon: Zap,
      requiresAuth: true,
    },
    {
      name: 'Create Community',
      href: '/create-community',
      icon: Star,
      requiresAuth: true,
    },
  ]

  const adminItems = user && userProfile?.isAdmin ? [
    {
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      requiresAuth: true,
    }
  ] : []

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="flex justify-around items-center h-16">
          {navigationItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const isDisabled = item.requiresAuth && !user
            
            if (isDisabled) {
              return (
                <button
                  key={item.name}
                  onClick={showLoginPopup}
                  className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 dark:text-gray-400"
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.name}</span>
                </button>
              )
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                  isActive
                    ? "text-orange-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </Link>
            )
          })}
          
          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-xs">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-2 gap-4">
              {/* Additional Navigation Items */}
              {navigationItems.slice(4).map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                const isDisabled = item.requiresAuth && !user
                
                if (isDisabled) {
                  return (
                    <button
                      key={item.name}
                      onClick={showLoginPopup}
                      className="flex items-center space-x-3 p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.name}</span>
                    </button>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                      isActive
                        ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}

              {/* User Items */}
              {userItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                const isDisabled = item.requiresAuth && !user
                
                if (isDisabled) {
                  return (
                    <button
                      key={item.name}
                      onClick={showLoginPopup}
                      className="flex items-center space-x-3 p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.name}</span>
                    </button>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                      isActive
                        ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}

              {/* Admin Items */}
              {adminItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                      isActive
                        ? "text-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom padding for mobile */}
      <div className="md:hidden h-16"></div>
    </>
  )
}
