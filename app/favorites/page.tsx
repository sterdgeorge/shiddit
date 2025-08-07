'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PostCard from '@/components/feed/PostCard'
import { Heart, Trash2 } from 'lucide-react'

interface FavoritePost {
  id: string
  postId: string
  userId: string
  createdAt: Date
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
}

export default function FavoritesPage() {
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const [favorites, setFavorites] = useState<FavoritePost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Fetch user's favorite posts
    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    )

    const unsubscribeFavorites = onSnapshot(favoritesQuery, async (snapshot) => {
      const favoritesData: FavoritePost[] = []
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data()
        try {
          // Fetch the actual post data
          const postDoc = await getDoc(doc(db, 'posts', data.postId))
          if (postDoc.exists()) {
            const postData = postDoc.data()
            favoritesData.push({
              id: docSnapshot.id,
              postId: data.postId,
              userId: data.userId,
              createdAt: data.createdAt?.toDate() || new Date(),
              post: {
                id: postDoc.id,
                title: postData?.title || '',
                content: postData?.content || '',
                authorUsername: postData?.authorUsername || '',
                communityName: postData?.communityName || '',
                createdAt: postData?.createdAt || new Date(),
                score: postData?.score || 0,
                upvotes: postData?.upvotes || [],
                downvotes: postData?.downvotes || [],
                commentCount: postData?.commentCount || 0,
                type: postData?.type || 'text',
                url: postData?.url,
                imageUrl: postData?.imageUrl,
                videoUrl: postData?.videoUrl,
                isPinned: postData?.isPinned || false
              }
            })
          }
        } catch (error) {
          console.error('Error fetching post:', error)
        }
      }
      
      setFavorites(favoritesData)
      setLoading(false)
    })

    return () => unsubscribeFavorites()
  }, [user])

  const removeFavorite = async (favoriteId: string) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, 'favorites', favoriteId))
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('Failed to remove favorite. Please try again.')
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to view your favorites
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
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Favorites
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Posts you've saved for later
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start exploring posts and save your favorites by clicking the heart icon
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="relative">
                <PostCard post={favorite.post} />
                <button
                  onClick={() => removeFavorite(favorite.id)}
                  className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
