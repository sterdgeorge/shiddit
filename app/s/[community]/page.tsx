'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'
import PostCard from '@/components/feed/PostCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { Hash, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Post {
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

interface Community {
  id: string
  name: string
  displayName: string
  description: string
  creatorId: string
  creatorUsername: string
  createdAt: Date
  memberCount: number
}

export default function CommunityPage() {
  const params = useParams()
  const communityName = params.community as string
  
  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCommunityAndPosts = async () => {
      try {
        // Fetch community info
        const communityQuery = query(
          collection(db, 'communities'),
          where('name', '==', communityName)
        )
        const communitySnapshot = await getDocs(communityQuery)
        
        if (communitySnapshot.empty) {
          setError('Community not found')
          setLoading(false)
          return
        }

        const communityData = communitySnapshot.docs[0].data()
        const communityInfo: Community = {
          id: communitySnapshot.docs[0].id,
          name: communityData.name,
          displayName: communityData.displayName,
          description: communityData.description,
          creatorId: communityData.creatorId,
          creatorUsername: communityData.creatorUsername,
          createdAt: communityData.createdAt?.toDate() || new Date(),
          memberCount: communityData.memberCount || 0
        }
        setCommunity(communityInfo)

        // Fetch posts from this community
        const postsQuery = query(
          collection(db, 'posts'),
          where('communityName', '==', communityName),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
        
        const postsSnapshot = await getDocs(postsQuery)
        const postsData: Post[] = []
        
        postsSnapshot.forEach((doc) => {
          const data = doc.data()
          postsData.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            authorUsername: data.authorUsername,
            communityName: data.communityName,
            createdAt: data.createdAt,
            score: data.score || 0,
            upvotes: data.upvotes || [],
            downvotes: data.downvotes || [],
            commentCount: data.commentCount || 0,
            type: data.type || 'text',
            url: data.url,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            isPinned: data.isPinned || false,
          })
        })
        
        setPosts(postsData)
      } catch (error) {
        console.error('Error fetching community:', error)
        setError('Failed to load community')
      } finally {
        setLoading(false)
      }
    }

    fetchCommunityAndPosts()
  }, [communityName])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  if (error || !community) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Community Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The community "s/{communityName}" doesn't exist or has been removed.
          </p>
          <Link href="/create-community">
            <Button>Create Community</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Community Header */}
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center">
                <Hash className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  s/{community.displayName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {community.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{community.memberCount} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {community.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Link href="/create-post">
              <Button className="flex items-center space-x-2">
                <span>Create Post</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first to share something in s/{community.displayName}!
            </p>
            <Link href="/create-post">
              <Button>Create Post</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
} 