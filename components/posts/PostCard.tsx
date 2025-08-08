'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { votePost } from '@/lib/posts'
import VoteButtons from '@/components/ui/VoteButtons'
import { MessageSquare, Share, MoreHorizontal, Clock, Award } from 'lucide-react'
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
    type: 'text' | 'image' | 'video' | 'link' | 'poll'
    url?: string
    imageUrl?: string
    videoUrl?: string
    isPinned?: boolean
  }
  showCommunity?: boolean
}

export default function PostCard({ post, showCommunity = true }: PostCardProps) {
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote' | 'remove') => {
    if (!user) return
            await votePost(postId, user.uid, voteType)
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

  const formatScore = (score: number) => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`
    }
    return score.toString()
  }

  const renderContent = () => {
    if (post.type === 'image' && post.imageUrl) {
      return (
        <div className="mt-2">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="max-w-full h-auto rounded-lg cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      )
    }
    
    if (post.type === 'video' && post.videoUrl) {
      return (
        <div className="mt-2">
          <video 
            src={post.videoUrl} 
            controls
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )
    }
    
    if (post.type === 'link' && post.url) {
      return (
        <div className="mt-2">
          <a 
            href={post.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {post.url}
          </a>
        </div>
      )
    }
    
    if (post.content && (isExpanded || post.content.length < 200)) {
      return (
        <div className="mt-2 text-gray-700 dark:text-gray-300">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>
      )
    }
    
    if (post.content && post.content.length >= 200) {
      return (
        <div className="mt-2 text-gray-700 dark:text-gray-300">
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
    
    return null
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden",
      post.isPinned && "border-l-4 border-l-orange-500"
    )}>
      <div className="flex">
        {/* Voting Section */}
        <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-900">
          <VoteButtons
            score={post.score}
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            userId={user?.uid}
            onVote={(voteType) => handleVote(post.id, voteType)}
            size="md"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
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
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(post.createdAt)}</span>
            </div>
            {post.isPinned && (
              <>
                <span>•</span>
                <span className="text-orange-500 font-medium">Pinned</span>
              </>
            )}
          </div>

          {/* Title */}
          <Link href={`/post/${post.id}`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2">
              {post.title}
            </h2>
          </Link>

          {/* Content */}
          {renderContent()}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <Link 
                href={`/post/${post.id}`}
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{post.commentCount} Comments</span>
              </Link>
              
              <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
              
              <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <Award className="w-4 h-4" />
                <span>Award</span>
              </button>
            </div>

            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 