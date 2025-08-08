'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, getDocs, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import { Plus, Hash, Camera } from 'lucide-react'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [communityImage, setCommunityImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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

    // Validate image if provided
    if (communityImage) {
      if (!communityImage.type.startsWith('image/')) {
        setError('Please select a valid image file')
        setLoading(false)
        return
      }
      
      if (communityImage.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB')
        setLoading(false)
        return
      }
    }

    try {
            // Check if community name already exists (case insensitive)
      const allCommunitiesQuery = query(collection(db, 'communities'))
      const allCommunitiesSnapshot = await getDocs(allCommunitiesQuery)
      const existingCommunity = allCommunitiesSnapshot.docs.find(doc => 
        doc.data().name.toLowerCase() === name.toLowerCase()
      )
      
      if (existingCommunity) {
        setError('Community name already exists')
        setLoading(false)
        return
      }

      // Check community creation limit (5 communities)
      const userCommunitiesQuery = query(
        collection(db, 'communities'),
        where('creatorId', '==', user!.uid)
      )
      const userCommunitiesSnapshot = await getDocs(userCommunitiesQuery)
      const currentCreationCount = userCommunitiesSnapshot.size

      if (currentCreationCount >= 5) {
        setError('You can only create up to 5 communities. Please delete some communities before creating new ones.')
        setLoading(false)
        return
      }

      // Create community and membership in a batch for consistency
      const batch = writeBatch(db)
      
      // Create community document
      const communityRef = doc(collection(db, 'communities'))
      const communityData = {
        name: name.toLowerCase(),
        displayName: name,
        description: description.trim(),
        creatorId: user!.uid,
        creatorUsername: userProfile!.username,
        createdAt: serverTimestamp(),
        memberCount: 1,
        postCount: 0,
        members: [user!.uid],
        type: 'public',
        nsfw: false,
        imageUrl: null
      }
      
      batch.set(communityRef, communityData)
      
      // Create community membership for the creator
      const membershipRef = doc(collection(db, 'communityMembers'))
      const membershipData = {
        communityId: communityRef.id,
        userId: user!.uid,
        username: userProfile!.username,
        joinedAt: serverTimestamp(),
        role: 'creator'
      }
      
      batch.set(membershipRef, membershipData)
      
      // Commit the batch
      await batch.commit()
      console.log('Community and membership created successfully')

      // Upload community image if provided
      if (communityImage) {
        try {
          console.log('Uploading community image:', communityImage.name)
          const { uploadImage } = await import('@/lib/cloudinary')
          
          const imageUrl = await uploadImage(communityImage, `communities/${communityRef.id}`)
          console.log('Image URL:', imageUrl)
          
          // Update community with image URL
          await updateDoc(communityRef, {
            imageUrl: imageUrl
          })
          console.log('Community updated with image URL')
        } catch (uploadError) {
          console.error('Error uploading community image:', uploadError)
          // Continue without image if upload fails
        }
      }

      router.push(`/s/${name.toLowerCase()}`)
    } catch (error: any) {
      console.error('Error creating community:', error)
      setError('Failed to create community. Please try again.')
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

              {/* Community Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Community Image (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Hash className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setCommunityImage(file)
                            setImagePreview(URL.createObjectURL(file))
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {communityImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setCommunityImage(null)
                          setImagePreview(null)
                        }}
                        className="ml-2 text-sm text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Upload a square image (max 5MB) to represent your community
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