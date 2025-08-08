'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { votePost } from '@/lib/posts'
import VoteButtons from '@/components/ui/VoteButtons'
import { Share, MoreHorizontal, Clock, Award, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    authorUsername: string
    communityName: string
    createdAt: any
    score: number
    upvotes: string[]
    downvotes: string[]
    commentCount: number
    imageUrl?: string
    videoUrl?: string
    isPinned?: boolean
  }
  showCommunity?: boolean
}

export default function PostCard({ post: initialPost, showCommunity = true }: PostCardProps) {
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [post, setPost] = useState(initialPost)

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) return
    
    try {
      // Determine the actual vote type based on current state
      const hasUpvoted = post.upvotes?.includes(user.uid) || false
      const hasDownvoted = post.downvotes?.includes(user.uid) || false
      
      let actualVoteType: 'upvote' | 'downvote' | 'remove'
      
      if (voteType === 'upvote') {
        if (hasUpvoted) {
          actualVoteType = 'remove'
        } else {
          actualVoteType = 'upvote'
        }
      } else {
        if (hasDownvoted) {
          actualVoteType = 'remove'
        } else {
          actualVoteType = 'downvote'
        }
      }
      
      const result = await votePost(post.id, user.uid, actualVoteType)
      
      // Update local state instead of refreshing
      setPost(prevPost => ({
        ...prevPost,
        upvotes: result.upvotes,
        downvotes: result.downvotes,
        score: result.score
      }))
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Unknown'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const renderContent = () => {
    const contentElements = []

    // Always show text content if it exists
    if (post.content) {
      if (isExpanded || post.content.length < 200) {
        contentElements.push(
          <div key="text" className="mt-2 text-gray-700 dark:text-gray-300">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
        )
      } else {
        contentElements.push(
          <div key="text" className="mt-2 text-gray-700 dark:text-gray-300">
            <p className="whitespace-pre-wrap">
              {post.content.substring(0, 200)}...
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-1"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        )
      }
    }

    // Show image if it exists
    if (post.imageUrl) {
      contentElements.push(
        <div key="image" className="mt-2">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="max-w-full h-auto rounded-lg cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      )
    }

    // Show video if it exists
    if (post.videoUrl) {
      contentElements.push(
        <div key="video" className="mt-2">
          <video 
            src={post.videoUrl} 
            controls
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )
    }

    return contentElements.length > 0 ? contentElements : null
  }

  return (
    <div className={cn(
      "post-card mb-2",
      post.isPinned && "border-l-4 border-l-orange-500"
    )}>
      <div className="p-4">
                               {/* Header */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <div className="flex items-center gap-1.5">
              {showCommunity && (
                <>
                  <Link 
                    href={`/s/${post.communityName}`}
                    className="font-medium text-gray-900 dark:text-gray-100 hover:underline"
                  >
                    s/{post.communityName}
                  </Link>
                  <span>•</span>
                </>
              )}
              <span>Posted by</span>
              <Link 
                href={`/user/${post.authorUsername}`}
                className="hover:underline"
              >
                u/{post.authorUsername}
              </Link>
              <span>•</span>
              <span>{formatTime(post.createdAt)}</span>
              {post.isPinned && (
                <>
                  <span>•</span>
                  <span className="text-orange-500 font-medium">Pinned</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors">
                Join
              </button>
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

                    {/* Title */}
          <Link href={`/s/${post.communityName}/comments/${post.id}`}>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2">
              {post.title}
            </h2>
          </Link>

          {/* Content */}
          {renderContent()}

          {/* Footer */}
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <VoteButtons
              score={post.score}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              userId={user?.uid}
              onVote={handleVote}
              size="sm"
              orientation="horizontal"
            />
            
            <Link 
              href={`/s/${post.communityName}/comments/${post.id}`}
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-base"
            >
              <Hash className="w-4 h-4" />
              <span>{post.commentCount} Comments</span>
            </Link>
            
            <button 
              onClick={() => {
                const url = `${window.location.origin}/s/${post.communityName}/comments/${post.id}`
                navigator.clipboard.writeText(url)
                // You could add a toast notification here
              }}
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-base"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    )
  } 