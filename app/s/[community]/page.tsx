'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/providers/AuthProvider'
import { joinCommunity, isCommunityMember } from '@/lib/communities'
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

interface Community {
  id: string
  name: string
  displayName: string
  description: string
  creatorId: string
  creatorUsername: string
  createdAt: Date
  memberCount: number
  imageUrl?: string
}

export default function CommunityPage() {
  const params = useParams()
  const { user } = useAuth()
  const communityName = params.community as string
  
  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const fetchCommunityAndPosts = async () => {
      try {
        console.log('Looking for community:', communityName)
        
        // Fetch community info (case-insensitive)
        const communitiesQuery = query(collection(db, 'communities'))
        const communitiesSnapshot = await getDocs(communitiesQuery)
        
        console.log('Found communities:', communitiesSnapshot.docs.map(doc => doc.data().name))
        
        const communityDoc = communitiesSnapshot.docs.find(doc => 
          doc.data().name.toLowerCase() === communityName.toLowerCase()
        )
        
        if (!communityDoc) {
          console.log('Community not found in database')
          setError('Community not found')
          setLoading(false)
          return
        }
        
        console.log('Found community:', communityDoc.data().name)

        const communityData = communityDoc.data()
        const communityInfo: Community = {
          id: communityDoc.id,
          name: communityData.name,
          displayName: communityData.displayName || communityData.name,
          description: communityData.description,
          creatorId: communityData.creatorId,
          creatorUsername: communityData.creatorUsername,
          createdAt: communityData.createdAt?.toDate() || new Date(),
          memberCount: communityData.memberCount || 0,
          imageUrl: communityData.imageUrl
        }
        console.log('Community info:', communityInfo)
        setCommunity(communityInfo)

        // Fetch posts from this community (case-insensitive)
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
        
        const postsSnapshot = await getDocs(postsQuery)
        const postsData: Post[] = []
        
        postsSnapshot.forEach((doc) => {
          const data = doc.data()
          // Filter posts by community name (case-insensitive)
          if (data.communityName && data.communityName.toLowerCase() === communityName.toLowerCase()) {
            postsData.push({
              id: doc.id,
              title: data.title,
              content: data.content,
              authorId: data.authorId,
              authorUsername: data.authorUsername,
              communityName: data.communityName,
              createdAt: data.createdAt,
              score: data.score || 0,
              upvotes: data.upvotes || [],
              downvotes: data.downvotes || [],
              commentCount: data.commentCount || 0,
              imageUrl: data.imageUrl,
              videoUrl: data.videoUrl,
              isPinned: data.isPinned || false,
            })
          }
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

  // Check if user is a member of this community
  useEffect(() => {
    const checkMembership = async () => {
      if (user && community) {
        try {
          console.log('Checking membership for user:', user.uid, 'in community:', community.id)
          console.log('Community data:', community)
          const membership = await isCommunityMember(community.id, user.uid)
          console.log('Membership result:', membership)
          setIsMember(membership)
        } catch (error) {
          console.error('Error checking membership:', error)
        }
      }
    }
    
    checkMembership()
  }, [user, community])

  const handleJoinCommunity = async () => {
    if (!user) {
      alert('Please log in to join communities')
      return
    }

    if (!community) return

    setJoining(true)
    try {
      console.log('Joining community:', community.id, 'for user:', user.uid)
      await joinCommunity(community.id, user.uid, user.displayName || user.email?.split('@')[0] || 'Anonymous')
      console.log('Successfully joined community')
      setIsMember(true)
      setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null)
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
              <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center overflow-hidden">
                {community.imageUrl ? (
                  <img
                    src={community.imageUrl}
                    alt={community.displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide the image and show the hash icon if it fails to load
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <Hash className={`w-8 h-8 text-white ${community.imageUrl ? 'hidden' : ''}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  s/{community.name}
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
            
            {user ? (
              <button
                onClick={handleJoinCommunity}
                disabled={joining || isMember}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMember 
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                } ${joining && 'opacity-50 cursor-not-allowed'}`}
              >
                {joining ? 'Joining...' : isMember ? 'Joined' : 'Join'}
              </button>
            ) : (
              <Link href="/login">
                <Button className="flex items-center space-x-2">
                  <span>Login to Join</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first to share something in s/{community.name}!
            </p>
            {isMember ? (
              <Link href="/create-post">
                <Button>Create Post</Button>
              </Link>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Join the community to create posts!
              </p>
            )}
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