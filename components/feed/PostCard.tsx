'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { votePost } from '@/lib/posts'
import { joinCommunity, isCommunityMember } from '@/lib/communities'
import VoteButtons from '@/components/ui/VoteButtons'
import { Share, Clock, Award, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    authorId: string
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
  const [isMember, setIsMember] = useState(false)
  const [joining, setJoining] = useState(false)

  // Check if user is a member of this community
  useEffect(() => {
    const checkMembership = async () => {
      if (user && post.communityName) {
        try {
          // For now, we'll use a simple approach - you can enhance this later
          // by storing community IDs in the post data or fetching community info
          const membership = await isCommunityMember(post.communityName, user.uid)
          setIsMember(membership)
        } catch (error) {
          console.error('Error checking membership:', error)
        }
      }
    }
    
    checkMembership()
  }, [user, post.communityName])

  const handleJoinCommunity = async () => {
    if (!user) {
      alert('Please log in to join communities')
      return
    }

    setJoining(true)
    try {
      // For now, we'll use the community name as ID
      // In a real implementation, you'd want to store community IDs in posts
      await joinCommunity(post.communityName, user.uid, user.displayName || user.email?.split('@')[0] || 'Anonymous')
      setIsMember(true)
      alert('Successfully joined the community!')
    } catch (error) {
      console.error('Error joining community:', error)
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Failed to join community')
      }
    } finally {
      setJoining(false)
    }
  }

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    console.log('handleVote called:', { 
      voteType, 
      userId: user?.uid, 
      postId: post.id, 
      postAuthor: post.authorUsername,
      isOwnPost: user?.uid === post.authorId 
    })
    
    if (!user) {
      console.log('No user logged in')
      return
    }
    
    try {
      // Determine the actual vote type based on current state
      const hasUpvoted = post.upvotes?.includes(user.uid) || false
      const hasDownvoted = post.downvotes?.includes(user.uid) || false
      
      console.log('Current vote state:', { hasUpvoted, hasDownvoted })
      
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
      
      console.log('Calling votePost with:', { postId: post.id, userId: user.uid, voteType: actualVoteType })
      
      const result = await votePost(post.id, user.uid, actualVoteType)
      
      console.log('Vote result:', result)
      
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
      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
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
            <button 
              onClick={handleJoinCommunity}
              disabled={joining}
              className={cn(
                "px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors",
                isMember 
                  ? "bg-gray-500 hover:bg-gray-600 text-white cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white",
                joining && "opacity-50 cursor-not-allowed"
              )}
            >
              {joining ? 'Joining...' : isMember ? 'Joined' : 'Join'}
            </button>
          </div>
        </div>

        {/* Title */}
        <Link href={`/s/${post.communityName}/comments/${post.id}`}>
          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2">
            {post.title}
          </h2>
        </Link>

          {/* Content */}
          {renderContent()}

        {/* Footer */}
        <div className="flex items-center gap-3 sm:gap-6 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <VoteButtons
              score={post.score}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              userId={user?.uid}
              onVote={handleVote}
              size="sm"
              orientation="horizontal"
            />
            {!user && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Login to vote
              </span>
            )}
          </div>
          
          <Link 
            href={`/s/${post.communityName}/comments/${post.id}`}
            className="flex items-center gap-1 sm:gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm sm:text-base"
          >
            <Hash className="w-4 h-4" />
            <span className="hidden sm:inline">{post.commentCount} Comments</span>
            <span className="sm:hidden">{post.commentCount}</span>
          </Link>
          
          <button 
            onClick={async () => {
              try {
                const url = `${window.location.origin}/s/${post.communityName}/comments/${post.id}`
                await navigator.clipboard.writeText(url)
                // Add visual feedback
                const button = event?.target as HTMLElement
                if (button) {
                  const originalText = button.textContent
                  button.textContent = 'Copied!'
                  button.classList.add('text-green-500')
                  setTimeout(() => {
                    button.textContent = originalText
                    button.classList.remove('text-green-500')
                  }, 2000)
                }
              } catch (error) {
                console.error('Failed to copy to clipboard:', error)
                // Fallback for older browsers
                const url = `${window.location.origin}/s/${post.communityName}/comments/${post.id}`
                const textArea = document.createElement('textarea')
                textArea.value = url
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
              }
            }}
            className="flex items-center gap-1 sm:gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm sm:text-base transition-colors"
          >
            <Share className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
        </div>
      </div>
    )
  } 