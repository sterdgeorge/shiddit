'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import PostCard from '@/components/feed/PostCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Trophy } from 'lucide-react'
import { getTopPosts, Post } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export default function LeaderboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const postsData = await getTopPosts(10)
        setPosts(postsData)
      } catch (error) {
        console.error('Error fetching top posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopPosts()
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Top Shit Posts
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The most liked posts on Shiddit
            </p>
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Be the first to create a post and get it to the top!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div key={post.id} className="relative">
                {/* Rank Badge */}
                <div className="absolute -left-2 -top-2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' : 'bg-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
} 