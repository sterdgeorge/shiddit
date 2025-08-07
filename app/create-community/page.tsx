'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import { Plus, Hash } from 'lucide-react'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!name.trim() || !description.trim()) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (name.length < 3) {
      setError('Community name must be at least 3 characters long')
      setLoading(false)
      return
    }

    if (name.length > 21) {
      setError('Community name must be 21 characters or less')
      setLoading(false)
      return
    }

    // Check if name contains only valid characters
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError('Community name can only contain letters, numbers, and underscores')
      setLoading(false)
      return
    }

    try {
      // Create community document
      const communityRef = await addDoc(collection(db, 'communities'), {
        name: name.toLowerCase(),
        displayName: name,
        description: description.trim(),
        creatorId: user!.uid,
        creatorUsername: userProfile!.username,
        createdAt: serverTimestamp(),
        memberCount: 1,
        members: [user!.uid]
      })

      // Create community name reference for uniqueness
      await setDoc(doc(db, 'communityNames', name.toLowerCase()), {
        communityId: communityRef.id,
        createdAt: serverTimestamp()
      })

      router.push(`/s/${name.toLowerCase()}`)
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        setError('Community name already exists')
      } else {
        setError(error.message || 'Failed to create community')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to create a community
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Community
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new community for people to share and discuss
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="card p-6">
            <div className="space-y-4">
              {/* Community Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Community Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">s/</span>
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                    minLength={3}
                    maxLength={21}
                    className="input-field pl-8"
                    placeholder="community_name"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Community names cannot be changed later. Use 3-21 characters, letters, numbers, and underscores only.
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  maxLength={500}
                  className="input-field resize-none"
                  placeholder="Describe what your community is about..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Community Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Community Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="public"
                      defaultChecked
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Public - Anyone can view, submit, and comment
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="restricted"
                      disabled
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      Restricted - Anyone can view, but only approved users can submit
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="private"
                      disabled
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      Private - Only approved users can view and submit
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Only public communities are available for now
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Community'}</span>
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
} 