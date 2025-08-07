'use client'

import { useState } from 'react'
import { TrendingUp, Clock, Trophy, Zap, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SortOption = 'hot' | 'new' | 'rising'

interface FeedSortProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
}

const sortOptions = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'new', label: 'New', icon: Clock },
  { value: 'rising', label: 'Rising', icon: TrendingUp },
] as const

export default function FeedSort({ currentSort, onSortChange }: FeedSortProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 mb-4 shadow-sm">
      <div className="flex items-center space-x-0">
        {sortOptions.map((option) => {
          const Icon = option.icon
          const isActive = currentSort === option.value
          
          return (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value as SortOption)}
                             className={cn(
                 'flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors',
                 isActive
                   ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                   : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
               )}
            >
              <Icon className="w-4 h-4" />
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
} 