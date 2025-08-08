'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminVotePost } from '@/lib/admin'

interface AdminVoteButtonsProps {
  postId: string
  score: number
  upvotes: string[]
  downvotes: string[]
  userId?: string
  onVote: (voteType: 'upvote' | 'downvote') => void
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'vertical' | 'horizontal'
  isComment?: boolean
}

export default function AdminVoteButtons({
  postId,
  score,
  upvotes,
  downvotes,
  userId,
  onVote,
  size = 'md',
  orientation = 'vertical',
  isComment = false
}: AdminVoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [voteCount, setVoteCount] = useState(1)
  const [isAdminVoting, setIsAdminVoting] = useState(false)

  const hasUpvoted = userId && upvotes ? upvotes.includes(userId) : false
  const hasDownvoted = userId && downvotes ? downvotes.includes(userId) : false

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    console.log('VoteButtons handleVote called:', { voteType, userId, isVoting })
    
    if (!userId || isVoting) {
      console.log('Vote blocked:', { userId: !!userId, isVoting })
      return
    }

    setIsVoting(true)
    try {
      console.log('Calling onVote function')
      await onVote(voteType)
      console.log('Vote successful')
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleAdminVote = async (voteType: 'upvote' | 'downvote' | 'remove') => {
    if (!userId) return

    setIsAdminVoting(true)
    try {
      await adminVotePost(postId, userId, voteType, voteCount)
      // Refresh the component by calling the parent's onVote
      if (voteType !== 'remove') {
        await onVote(voteType)
      }
      setShowAdminPanel(false)
    } catch (error) {
      console.error('Admin vote failed:', error)
      alert(error instanceof Error ? error.message : 'Admin vote failed')
    } finally {
      setIsAdminVoting(false)
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
    'flex items-center gap-1 relative',
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

      {/* Admin Panel Toggle */}
      <button
        onClick={() => setShowAdminPanel(!showAdminPanel)}
        className={cn(
          'p-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600',
          'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
          showAdminPanel && 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
        )}
        title="Admin Controls"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Admin Controls</h4>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Vote Count
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={voteCount}
                onChange={(e) => setVoteCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={() => handleAdminVote('upvote')}
                disabled={isAdminVoting}
                className="flex-1 px-2 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                +{voteCount}
              </button>
              <button
                onClick={() => handleAdminVote('downvote')}
                disabled={isAdminVoting}
                className="flex-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                -{voteCount}
              </button>
            </div>
            
            <button
              onClick={() => handleAdminVote('remove')}
              disabled={isAdminVoting}
              className="w-full px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors disabled:opacity-50"
            >
              Remove All Votes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
