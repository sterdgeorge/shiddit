'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoteButtonsProps {
  score: number
  upvotes: string[]
  downvotes: string[]
  userId?: string
  onVote: (voteType: 'upvote' | 'downvote', isAdmin?: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'vertical' | 'horizontal'
  isComment?: boolean
  isAdmin?: boolean
}

export default function VoteButtons({
  score,
  upvotes,
  downvotes,
  userId,
  onVote,
  size = 'md',
  orientation = 'vertical',
  isComment = false,
  isAdmin = false
}: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false)

  const hasUpvoted = userId && upvotes ? upvotes.includes(userId) : false
  const hasDownvoted = userId && downvotes ? downvotes.includes(userId) : false

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    console.log('VoteButtons handleVote called:', { voteType, userId, isVoting, isAdmin })
    
    if (!userId || isVoting) {
      console.log('Vote blocked:', { userId: !!userId, isVoting })
      return
    }

    setIsVoting(true)
    try {
      console.log('Calling onVote function with admin status:', isAdmin)
      await onVote(voteType, isAdmin)
      console.log('Vote successful')
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
          'p-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600',
          hasUpvoted
            ? 'text-orange-500 hover:text-orange-600 bg-orange-50 dark:bg-orange-900/20'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
          isVoting && 'opacity-50 cursor-not-allowed'
        )}
        title={userId ? 'Upvote' : 'Login to vote'}
      >
        <ChevronUp className={getSizeClasses()} />
      </button>

      <span className={cn(
        'font-semibold min-w-[1.5rem] text-center px-1',
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
          'p-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600',
          hasDownvoted
            ? 'text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
          isVoting && 'opacity-50 cursor-not-allowed'
        )}
        title={userId ? 'Downvote' : 'Login to vote'}
      >
        <ChevronDown className={getSizeClasses()} />
      </button>
    </div>
  )
} 