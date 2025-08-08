'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Hash } from 'lucide-react'

interface Community {
  id: string
  name: string
  displayName: string
  memberCount: number
  imageUrl?: string
}

export default function PopularCommunities() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopularCommunities = async () => {
      try {
        const communitiesQuery = query(
          collection(db, 'communities'),
          orderBy('memberCount', 'desc'),
          limit(5)
        )
        const snapshot = await getDocs(communitiesQuery)
        const communitiesData: Community[] = []

        snapshot.forEach((doc) => {
          const data = doc.data()
          communitiesData.push({
            id: doc.id,
            name: data.name,
            displayName: data.displayName || data.name,
            memberCount: data.memberCount || 0,
            imageUrl: data.imageUrl
          })
        })

        setCommunities(communitiesData)
      } catch (error) {
        console.error('Error fetching popular communities:', error)
        // If there's an error with ordering, try without orderBy
        try {
          const fallbackQuery = query(
            collection(db, 'communities'),
            limit(5)
          )
          const fallbackSnapshot = await getDocs(fallbackQuery)
          const fallbackData: Community[] = []

          fallbackSnapshot.forEach((doc) => {
            const data = doc.data()
            fallbackData.push({
              id: doc.id,
              name: data.name,
              displayName: data.displayName || data.name,
              memberCount: data.memberCount || 0,
              imageUrl: data.imageUrl
            })
          })

          setCommunities(fallbackData)
        } catch (fallbackError) {
          console.error('Error with fallback query:', fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPopularCommunities()
  }, [])

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
        Popular Communities
      </h2>
      
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Loading...
          </div>
        ) : communities.length > 0 ? (
          communities.map((community) => (
            <Link
              key={community.id}
              href={`/s/${community.name}`}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center overflow-hidden">
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
                <Hash className={`w-4 h-4 text-white ${community.imageUrl ? 'hidden' : ''}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  s/{community.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {community.memberCount} members
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No communities yet
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/communities"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          See more
        </Link>
      </div>
    </div>
  )
} 