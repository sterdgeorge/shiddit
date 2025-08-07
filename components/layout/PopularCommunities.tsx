'use client'

import Link from 'next/link'
import { Ghost, Box, Dumbbell, Sword, Video, Users } from 'lucide-react'

const popularCommunities: any[] = []

export default function PopularCommunities() {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
        Popular Communities
      </h2>
      
      <div className="space-y-3">
        {popularCommunities.length > 0 ? (
          popularCommunities.map((community) => {
            const Icon = community.icon
            return (
              <Link
                key={community.name}
                href={`/s/${community.name}`}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${community.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    r/{community.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {community.members} members
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No communities yet
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/communities"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          See more
        </Link>
      </div>
    </div>
  )
} 