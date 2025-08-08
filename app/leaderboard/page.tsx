'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import PostCard from '@/components/feed/PostCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Trophy, Users, Crown } from 'lucide-react'
import { getTopPosts, Post } from '@/lib/posts'
import { getTopUsers } from '@/lib/userStats'
import DefaultProfilePicture from '@/components/ui/DefaultProfilePicture'
import XIcon from '@/components/ui/XIcon'

// Helper function to ensure URLs have proper protocol
const ensureUrlProtocol = (url: string): string => {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // Default to https:// for security
  return `https://${url}`
}

export const dynamic = 'force-dynamic'

export default function LeaderboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, usersData] = await Promise.all([
          getTopPosts(10),
          getTopUsers(5)
        ])
        setPosts(postsData)
        setTopUsers(usersData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

        {/* Daily Reward Notice */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-lg text-white">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">Daily Reward</h3>
              <p className="text-yellow-100">
                The top post of the day receives <span className="font-bold">67,000 $SHIT coins</span>
              </p>
            </div>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Top Users
            </h2>
          </div>
          
          {topUsers.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No users yet
            </div>
          ) : (
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' : 'bg-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Profile Picture */}
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.username} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <DefaultProfilePicture username={user.username} size="sm" />
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </span>
                      {user.twitterLink && (
                        <a
                          href={ensureUrlProtocol(user.twitterLink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          <XIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                                         <p className="text-sm text-gray-500 dark:text-gray-400">
                       {user.totalUpvotesReceived} upvotes received
                     </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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