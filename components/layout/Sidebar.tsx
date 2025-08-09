'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { Home, Trophy, Settings, Plus, Shield, Users, Star, Heart, Zap, User, ArrowLeftRight, Rocket, Crown, Users as UsersIcon, Hash, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCombinedStats, CombinedStats } from '@/lib/stats'
import { useEffect, useState } from 'react'


export default function Sidebar() {
  const pathname = usePathname()
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const [siteStats, setSiteStats] = useState<CombinedStats>({
    totalUsers: 0,
    onlineUsers: 1,
    totalLikes: 0,
    totalCommunities: 0,
    totalMembers: 0
  })

  // Fetch site stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getCombinedStats()
        setSiteStats(stats)
      } catch (error) {
        console.error('Error fetching site stats:', error)
      }
    }

    fetchStats()
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

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
      name: 'Manage Communities',
      href: '/community-management',
      icon: Hash,
      requiresAuth: true,
    },
    // Add admin link if user is admin
    ...(user && userProfile?.isAdmin ? [{
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      requiresAuth: true,
    }] : []),
  ]

  const actionItems = [
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

  const tokenItems = [
    {
      name: 'Swap Tokens',
      href: '/swap',
      icon: ArrowLeftRight,
      requiresAuth: false,
    },
    {
      name: 'Shit Launcher',
      href: '/launcher',
      icon: Rocket,
      requiresAuth: false,
    },
    {
      name: 'Shit Coins',
      href: '/shit-coins',
      icon: Coins,
      requiresAuth: false,
    },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-2 sm:p-4 fixed top-12 left-0 overflow-y-auto h-screen pt-4 z-30 shadow-lg md:shadow-none">
      <div className="space-y-6 sm:space-y-8">
        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const isDisabled = item.requiresAuth && !user
            
            if (isDisabled) {
              return (
                <button
                  key={item.name}
                  onClick={showLoginPopup}
                  className={cn(
                    'sidebar-item w-full text-left',
                    'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span>{item.name}</span>
                </button>
              )
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'sidebar-item',
                  isActive
                    ? 'sidebar-item-active'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                <Icon className="w-5 h-5 mr-2" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Action Items */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Actions
          </h3>
          <nav className="space-y-2">
            {actionItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              const isDisabled = !user
              
              if (isDisabled) {
                return (
                  <button
                    key={item.name}
                    onClick={showLoginPopup}
                    className={cn(
                      'sidebar-item w-full text-left',
                      'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    <span>{item.name}</span>
                  </button>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'sidebar-item',
                    isActive
                      ? 'sidebar-item-active'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Token Items */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Token
          </h3>
          <nav className="space-y-2">
            {tokenItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'sidebar-item',
                    isActive
                      ? 'sidebar-item-active'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Site Stats */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Site Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Users Online</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{siteStats.onlineUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Registered Users</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{siteStats.totalUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <Hash className="w-4 h-4 mr-2 text-orange-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Communities</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{siteStats.totalCommunities.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Total Likes</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{siteStats.totalLikes.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
} 