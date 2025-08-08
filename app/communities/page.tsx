'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { collection, query, orderBy, limit, getDocs, where, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import rateLimiter, { RATE_LIMITS } from '@/lib/rateLimit'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Hash, Users, Calendar, Plus, Search, TrendingUp, Clock, Star } from 'lucide-react'
import Link from 'next/link'

interface Community {
  id: string
  name: string
  displayName: string
  description: string
  memberCount: number
  postCount: number
  createdAt: any
  type: 'public' | 'restricted' | 'private'
  nsfw: boolean
  imageUrl?: string
  isJoined?: boolean
}

export default function CommunitiesPage() {
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'trending' | 'new' | 'popular'>('trending')
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)

  useEffect(() => {
    fetchCommunities()
  }, [sortBy])

  const fetchCommunities = async () => {
    try {
      setLoading(true)
      console.log('Fetching communities...')
      
      // Get all communities
      const communitiesQuery = query(
        collection(db, 'communities')
      )

      const snapshot = await getDocs(communitiesQuery)
      console.log('Found', snapshot.docs.length, 'communities in database')
      
      const communitiesData: Community[] = []

      for (const doc of snapshot.docs) {
        const data = doc.data()
        console.log('Processing community:', doc.id, data)
        
        // Handle missing or invalid data gracefully
        const communityData = {
          id: doc.id,
          name: data.name || 'unnamed',
          displayName: data.displayName || data.name || 'Unnamed Community',
          description: data.description || 'No description available',
          memberCount: data.memberCount || 0,
          postCount: data.postCount || 0,
          createdAt: data.createdAt || new Date(),
          type: data.type || 'public',
          nsfw: data.nsfw || false,
          imageUrl: data.imageUrl || null,
          isJoined: false
        }
        
        communitiesData.push(communityData)
      }

      // Sort the communities based on the selected sort option
      communitiesData.sort((a, b) => {
        switch (sortBy) {
          case 'new':
            const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0)
            const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0)
            return bDate.getTime() - aDate.getTime()
          case 'popular':
            return (b.memberCount || 0) - (a.memberCount || 0)
          default: // trending
            return (b.postCount || 0) - (a.postCount || 0)
        }
      })

      // Check if user is joined to communities
      if (user) {
        const userMembershipsQuery = query(
          collection(db, 'communityMembers'),
          where('userId', '==', user.uid)
        )
        const membershipsSnapshot = await getDocs(userMembershipsQuery)
        const joinedCommunityIds = membershipsSnapshot.docs.map(doc => doc.data().communityId)

        communitiesData.forEach(community => {
          community.isJoined = joinedCommunityIds.includes(community.id)
        })
      }

      console.log('Found communities:', communitiesData.length, communitiesData)
      setCommunities(communitiesData)
    } catch (error) {
      console.error('Error fetching communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      showLoginPopup()
      return
    }

    setJoiningCommunity(communityId)
    setJoinError(null)

    try {
      const communityRef = doc(db, 'communities', communityId)
      const communityDoc = await getDoc(communityRef)
      
      if (!communityDoc.exists()) {
        throw new Error('Community not found')
      }

      const communityData = communityDoc.data()
      const isCurrentlyJoined = communities.find(c => c.id === communityId)?.isJoined

      if (isCurrentlyJoined) {
        // Leave community - no limits on leaving
        await updateDoc(communityRef, {
          memberCount: Math.max(0, (communityData.memberCount || 0) - 1)
        })

        // Remove from user's memberships
        const membershipQuery = query(
          collection(db, 'communityMembers'),
          where('communityId', '==', communityId),
          where('userId', '==', user.uid)
        )
        const membershipSnapshot = await getDocs(membershipQuery)
        if (!membershipSnapshot.empty) {
          // Note: In a real app, you'd delete the document, but for now we'll just update the state
        }
      } else {
        // Check rate limiting for joining
        const rateLimitKey = `community_join_${user.uid}`
        const isAllowed = rateLimiter.checkRateLimit(
          rateLimitKey,
          RATE_LIMITS.COMMUNITY_JOIN.maxActions,
          RATE_LIMITS.COMMUNITY_JOIN.windowMs
        )

        if (!isAllowed) {
          const remainingTime = rateLimiter.getTimeUntilReset(
            rateLimitKey,
            RATE_LIMITS.COMMUNITY_JOIN.windowMs
          )
          const seconds = Math.ceil(remainingTime / 1000)
          throw new Error(`You can only join ${RATE_LIMITS.COMMUNITY_JOIN.maxActions} communities per minute. Please wait ${seconds} seconds.`)
        }

        // Check total community join limit (20 communities)
        const userMembershipsQuery = query(
          collection(db, 'communityMembers'),
          where('userId', '==', user.uid)
        )
        const membershipsSnapshot = await getDocs(userMembershipsQuery)
        const currentJoinCount = membershipsSnapshot.size

        if (currentJoinCount >= 20) {
          throw new Error('You can only join up to 20 communities. Please leave some communities before joining new ones.')
        }

        // Join community
        await updateDoc(communityRef, {
          memberCount: (communityData.memberCount || 0) + 1
        })

        // Add to user's memberships
        await updateDoc(doc(db, 'users', user.uid), {
          communities: arrayUnion(communityId)
        })
      }

      // Update local state
      setCommunities(prev => prev.map(community => 
        community.id === communityId 
          ? { 
              ...community, 
              isJoined: !community.isJoined,
              memberCount: community.isJoined 
                ? Math.max(0, community.memberCount - 1)
                : community.memberCount + 1
            }
          : community
      ))
    } catch (error) {
      console.error('Error joining/leaving community:', error)
      setJoinError(error instanceof Error ? error.message : 'Failed to join/leave community')
    } finally {
      setJoiningCommunity(null)
    }
  }

  // Filter communities based on search query
  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case 'trending': return <TrendingUp className="w-4 h-4" />
      case 'new': return <Clock className="w-4 h-4" />
      case 'popular': return <Star className="w-4 h-4" />
      default: return <TrendingUp className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Communities
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Discover and join communities that interest you
            </p>
          </div>
          <Link href="/create-community">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Community</span>
            </Button>
          </Link>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'new', label: 'New', icon: Clock },
              { id: 'popular', label: 'Popular', icon: Star }
            ].map((sort) => (
              <button
                key={sort.id}
                onClick={() => setSortBy(sort.id as any)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors ${
                  sortBy === sort.id
                    ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <sort.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{sort.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {joinError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {joinError}
            </p>
          </div>
        )}

        {/* Communities List */}
        <div className="space-y-4">
          {filteredCommunities.length === 0 ? (
            <div className="text-center py-12">
              <Hash className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No communities found' : 'No communities yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Be the first to create a community!'
                }
              </p>
            </div>
          ) : (
            filteredCommunities.map((community) => (
              <div
                key={community.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center overflow-hidden">
                      {community.imageUrl ? (
                        <img 
                          src={community.imageUrl} 
                          alt={community.displayName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Hash className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link 
                          href={`/s/${community.name}`}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                        >
                          s/{community.name}
                        </Link>
                        {community.nsfw && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded">
                            NSFW
                          </span>
                        )}
                        {community.type !== 'public' && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                            {community.type}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {community.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{community.memberCount.toLocaleString()} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{community.postCount.toLocaleString()} posts</span>
                        </div>
                        {community.createdAt && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created {community.createdAt.toDate().toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={community.isJoined ? 'secondary' : 'primary'}
                    onClick={() => handleJoinCommunity(community.id)}
                    disabled={joiningCommunity === community.id}
                    className="flex-shrink-0"
                  >
                    {joiningCommunity === community.id ? (
                      <LoadingSpinner />
                    ) : community.isJoined ? (
                      'Joined'
                    ) : (
                      'Join'
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  )
}
