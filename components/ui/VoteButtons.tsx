'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoteButtonsProps {
  score: number
  upvotes: string[]
  downvotes: string[]
  userId?: string
  onVote: (voteType: 'upvote' | 'downvote') => void
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'vertical' | 'horizontal'
  isComment?: boolean
}

export default function VoteButtons({
  score,
  upvotes,
  downvotes,
  userId,
  onVote,
  size = 'md',
  orientation = 'vertical',
  isComment = false
}: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false)

  const hasUpvoted = userId && upvotes ? upvotes.includes(userId) : false
  const hasDownvoted = userId && downvotes ? downvotes.includes(userId) : false

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!userId || isVoting) return

    setIsVoting(true)
    try {
      await onVote(voteType)
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6'
      case 'lg':
        return 'w-8 h-8'
      default:
        return 'w-7 h-7'
    }
  }

  const getScoreSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm font-semibold'
      case 'lg':
        return 'text-lg font-semibold'
      default:
        return 'text-sm font-semibold'
    }
  }

  const containerClasses = cn(
    'flex items-center gap-1',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col'
  )

  return (
    <div className={containerClasses}>
      <button
        onClick={() => handleVote('upvote')}
        disabled={isVoting}
        className={cn(
          'p-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
          hasUpvoted
            ? 'text-orange-500 hover:text-orange-600'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
          isVoting && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ChevronUp className={getSizeClasses()} />
      </button>

      <span className={cn(
        'font-semibold min-w-[1.5rem] text-center',
        getScoreSize(),
        score > 0 ? 'text-green-500 dark:text-green-400' :
        score < 0 ? 'text-red-500 dark:text-red-400' :
        'text-gray-500 dark:text-gray-400'
      )}>
        {score}
      </span>

      <button
        onClick={() => handleVote('downvote')}
        disabled={isVoting}
        className={cn(
          'p-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
          hasDownvoted
            ? 'text-blue-500 hover:text-blue-600'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
          isVoting && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ChevronDown className={getSizeClasses()} />
      </button>
    </div>
  )
} 