'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { collection, query, where, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Hash, Users, Calendar, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface UserCommunity {
  id: string
  name: string
  displayName: string
  description: string
  memberCount: number
  postCount: number
  createdAt: any
  type: 'public' | 'restricted' | 'private'
  nsfw: boolean
}

export default function CommunityManagementPage() {
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const [communities, setCommunities] = useState<UserCommunity[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingCommunity, setDeletingCommunity] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserCommunities()
    }
  }, [user])

  const fetchUserCommunities = async () => {
    if (!user) return

    try {
      setLoading(true)
      const communitiesQuery = query(
        collection(db, 'communities'),
        where('creatorId', '==', user.uid)
      )
      
      const snapshot = await getDocs(communitiesQuery)
      const communitiesData: UserCommunity[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        communitiesData.push({
          id: doc.id,
          name: data.name,
          displayName: data.displayName,
          description: data.description,
          memberCount: data.memberCount || 0,
          postCount: data.postCount || 0,
          createdAt: data.createdAt,
          type: data.type || 'public',
          nsfw: data.nsfw || false
        })
      })

      setCommunities(communitiesData)
    } catch (error) {
      console.error('Error fetching user communities:', error)
      setError('Failed to load your communities')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCommunity = async (communityId: string, communityName: string) => {
    if (!user) return

    const confirmMessage = `Are you sure you want to delete the community "s/${communityName}"? This action will permanently delete the community and all posts within it. This action cannot be undone.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setDeletingCommunity(communityId)
    setError(null)

    try {
      console.log('Starting community deletion for:', communityId, communityName)
      
      // Delete the community first
      const communityRef = doc(db, 'communities', communityId)
      await deleteDoc(communityRef)
      console.log('Community deleted successfully')

      // Delete all posts in the community
      try {
        const postsQuery = query(
          collection(db, 'posts'),
          where('communityId', '==', communityId)
        )
        const postsSnapshot = await getDocs(postsQuery)
        
        if (!postsSnapshot.empty) {
          // Delete posts in batches of 500 (Firestore limit)
          const postsToDelete = postsSnapshot.docs
          for (let i = 0; i < postsToDelete.length; i += 500) {
            const batch = writeBatch(db)
            const batchPosts = postsToDelete.slice(i, i + 500)
            batchPosts.forEach((postDoc) => {
              batch.delete(postDoc.ref)
            })
            await batch.commit()
          }
          console.log('Posts deleted successfully')
        }
      } catch (error) {
        console.log('Error deleting posts:', error)
      }

      // Delete all comments in posts from this community
      try {
        const commentsQuery = query(
          collection(db, 'comments'),
          where('communityId', '==', communityId)
        )
        const commentsSnapshot = await getDocs(commentsQuery)
        
        if (!commentsSnapshot.empty) {
          // Delete comments in batches of 500 (Firestore limit)
          const commentsToDelete = commentsSnapshot.docs
          for (let i = 0; i < commentsToDelete.length; i += 500) {
            const batch = writeBatch(db)
            const batchComments = commentsToDelete.slice(i, i + 500)
            batchComments.forEach((commentDoc) => {
              batch.delete(commentDoc.ref)
            })
            await batch.commit()
          }
          console.log('Comments deleted successfully')
        }
      } catch (error) {
        console.log('Comments collection might not exist, skipping...')
      }

      // Delete community memberships
      try {
        const membershipsQuery = query(
          collection(db, 'communityMembers'),
          where('communityId', '==', communityId)
        )
        const membershipsSnapshot = await getDocs(membershipsQuery)
        
        if (!membershipsSnapshot.empty) {
          // Delete memberships in batches of 500 (Firestore limit)
          const membershipsToDelete = membershipsSnapshot.docs
          for (let i = 0; i < membershipsToDelete.length; i += 500) {
            const batch = writeBatch(db)
            const batchMemberships = membershipsToDelete.slice(i, i + 500)
            batchMemberships.forEach((membershipDoc) => {
              batch.delete(membershipDoc.ref)
            })
            await batch.commit()
          }
          console.log('Memberships deleted successfully')
        }
      } catch (error) {
        console.log('Community members collection might not exist, skipping...')
      }

      // Update local state
      setCommunities(prev => prev.filter(community => community.id !== communityId))
      
      alert(`Community "s/${communityName}" has been deleted successfully.`)
    } catch (error) {
      console.error('Error deleting community:', error)
      setError(`Failed to delete community: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeletingCommunity(null)
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to manage your communities
          </p>
          <button
            onClick={showLoginPopup}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium transition-colors"
          >
            Log In
          </button>
        </div>
      </MainLayout>
    )
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage Your Communities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and delete communities you've created
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Communities List */}
        <div className="space-y-4">
          {communities.length === 0 ? (
            <div className="text-center py-12">
              <Hash className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No communities found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven't created any communities yet.
              </p>
              <Link
                href="/create-community"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <Hash className="w-4 h-4" />
                <span>Create Community</span>
              </Link>
            </div>
          ) : (
            communities.map((community) => (
              <div
                key={community.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Hash className="w-6 h-6 text-white" />
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
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/s/${community.name}`}
                      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      View
                    </Link>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteCommunity(community.id, community.name)}
                      disabled={deletingCommunity === community.id}
                      className="flex items-center space-x-1"
                    >
                      {deletingCommunity === community.id ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Warning */}
        {communities.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Important Notice
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Deleting a community will permanently remove it and all posts within it. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
