'use client'

import { useState, useEffect } from 'react'
import PostCard from './PostCard'
import FeedSort, { SortOption } from './FeedSort'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getSortedPosts, Post } from '@/lib/posts'

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('hot')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await getSortedPosts(sortBy)
        setPosts(postsData)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [sortBy])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No posts yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to share something interesting!
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <FeedSort currentSort={sortBy} onSortChange={setSortBy} />
      
      <div className="space-y-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
} 