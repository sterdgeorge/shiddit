'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { MessageSquare, Image, Link, BarChart3, AlertCircle, Users, X } from 'lucide-react'

interface Community {
  id: string
  name: string
  displayName: string
  description: string
  type: 'public' | 'restricted' | 'private'
  nsfw: boolean
  allowImages: boolean
  allowLinks: boolean
  allowPolls: boolean
}

interface PostForm {
  communityId: string
  title: string
  content: string
  type: 'text' | 'image' | 'link' | 'poll'
  imageUrl?: string
  linkUrl?: string
  pollOptions?: string[]
  pollDuration?: number
  nsfw: boolean
  spoiler: boolean
}

interface ValidationErrors {
  communityId?: string
  title?: string
  content?: string
  imageUrl?: string
  linkUrl?: string
  pollOptions?: string
  general?: string
}

export default function CreatePostPage() {
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [communities, setCommunities] = useState<Community[]>([])
  const [form, setForm] = useState<PostForm>({
    communityId: searchParams.get('community') || '',
    title: '',
    content: '',
    type: 'text',
    nsfw: false,
    spoiler: false
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [showCommunitySelect, setShowCommunitySelect] = useState(false)

  // Rate limiting
  const [lastPostTime, setLastPostTime] = useState<Date | null>(null)
  const MAX_POSTS_PER_HOUR = 10

  // Check if user can create posts
  const canCreatePost = () => {
    if (!lastPostTime) return true
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return lastPostTime < oneHourAgo
  }

  // Fetch user's communities
  useEffect(() => {
    if (!user) return

    const fetchCommunities = async () => {
      try {
        const membersQuery = query(
          collection(db, 'communityMembers'),
          where('userId', '==', user.uid)
        )
        
        const snapshot = await getDocs(membersQuery)
        const communityIds = snapshot.docs.map(doc => doc.data().communityId)
        
        if (communityIds.length === 0) return
        
        const communitiesData: Community[] = []
        for (const communityId of communityIds) {
          const communityDoc = await getDocs(query(
            collection(db, 'communities'),
            where('__name__', '==', communityId)
          ))
          
          if (!communityDoc.empty) {
            const data = communityDoc.docs[0].data()
            communitiesData.push({
              id: communityDoc.docs[0].id,
              name: data.name,
              displayName: data.displayName,
              description: data.description,
              type: data.type,
              nsfw: data.nsfw,
              allowImages: data.allowImages,
              allowLinks: data.allowLinks,
              allowPolls: data.allowPolls
            })
          }
        }
        
        setCommunities(communitiesData)
        
        // Set selected community if provided in URL
        if (form.communityId) {
          const community = communitiesData.find(c => c.id === form.communityId)
          if (community) {
            setSelectedCommunity(community)
          }
        }
      } catch (error) {
        console.error('Error fetching communities:', error)
      }
    }

    fetchCommunities()
  }, [user, form.communityId])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!form.communityId) {
      newErrors.communityId = 'Please select a community'
    }

    if (!form.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (form.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    } else if (form.title.length > 300) {
      newErrors.title = 'Title must be 300 characters or less'
    }

    if (form.type === 'text' && !form.content.trim()) {
      newErrors.content = 'Content is required for text posts'
    } else if (form.type === 'text' && form.content.length > 40000) {
      newErrors.content = 'Content must be 40,000 characters or less'
    }

    if (form.type === 'image' && !form.imageUrl?.trim()) {
      newErrors.imageUrl = 'Image URL is required for image posts'
    } else if (form.type === 'image' && form.imageUrl) {
      try {
        new URL(form.imageUrl)
      } catch {
        newErrors.imageUrl = 'Please enter a valid image URL'
      }
    }

    if (form.type === 'link' && !form.linkUrl?.trim()) {
      newErrors.linkUrl = 'Link URL is required for link posts'
    } else if (form.type === 'link' && form.linkUrl) {
      try {
        new URL(form.linkUrl)
      } catch {
        newErrors.linkUrl = 'Please enter a valid URL'
      }
    }

    if (form.type === 'poll') {
      if (!form.pollOptions || form.pollOptions.length < 2) {
        newErrors.pollOptions = 'Poll must have at least 2 options'
      } else if (form.pollOptions.length > 6) {
        newErrors.pollOptions = 'Poll can have maximum 6 options'
      } else if (form.pollOptions.some(option => !option.trim())) {
        newErrors.pollOptions = 'All poll options must have content'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof PostForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Clear errors when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof ValidationErrors]: undefined }))
    }
  }

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...(form.pollOptions || [])]
    newOptions[index] = value
    handleInputChange('pollOptions', newOptions)
  }

  const addPollOption = () => {
    const newOptions = [...(form.pollOptions || []), '']
    handleInputChange('pollOptions', newOptions)
  }

  const removePollOption = (index: number) => {
    const newOptions = form.pollOptions?.filter((_, i) => i !== index) || []
    handleInputChange('pollOptions', newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !userProfile) {
      showLoginPopup()
      return
    }

    // Security checks
    if (!canCreatePost()) {
      setErrors({ general: 'You can only create 10 posts per hour. Please wait before creating another.' })
      return
    }

    if (!selectedCommunity) {
      setErrors({ communityId: 'Please select a community' })
      return
    }

    // Check if user can post to this community
    if (selectedCommunity.type === 'restricted' || selectedCommunity.type === 'private') {
      // Check if user is approved member
      const memberQuery = query(
        collection(db, 'communityMembers'),
        where('communityId', '==', selectedCommunity.id),
        where('userId', '==', user.uid)
      )
      const memberSnapshot = await getDocs(memberQuery)
      
      if (memberSnapshot.empty) {
        setErrors({ communityId: 'You are not a member of this community' })
        return
      }
    }

    // Validation
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Create post
      const postData: any = {
        title: form.title.trim(),
        authorId: user.uid,
        authorUsername: userProfile.username,
        communityId: selectedCommunity.id,
        communityName: selectedCommunity.name,
        type: form.type,
        nsfw: form.nsfw || selectedCommunity.nsfw,
        spoiler: form.spoiler,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        score: 0,
        upvotes: [],
        downvotes: [],
        // Security metadata
        authorIP: 'client-side', // Will be validated server-side
        lastActivity: serverTimestamp()
      }

      // Add type-specific data
      if (form.type === 'text') {
        postData.content = form.content.trim()
      } else if (form.type === 'image') {
        postData.imageUrl = form.imageUrl?.trim()
      } else if (form.type === 'link') {
        postData.linkUrl = form.linkUrl?.trim()
      } else if (form.type === 'poll') {
        postData.pollOptions = form.pollOptions?.map(option => ({
          text: option.trim(),
          votes: 0
        }))
        postData.pollEndTime = new Date(Date.now() + (form.pollDuration || 7) * 24 * 60 * 60 * 1000)
      }

      const postRef = await addDoc(collection(db, 'posts'), postData)

      // Update community post count
      await updateDoc(doc(db, 'communities', selectedCommunity.id), {
        postCount: increment(1),
        lastActivity: serverTimestamp()
      })

      // Update rate limiting
      setLastPostTime(new Date())

      // Redirect to the new post
      router.push(`/s/${selectedCommunity.name}/comments/${postRef.id}`)
    } catch (error) {
      console.error('Error creating post:', error)
      setErrors({ general: 'Failed to create post. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to create a post
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create a Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share something with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Selection */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Choose a Community
            </h2>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowCommunitySelect(!showCommunitySelect)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {selectedCommunity ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {selectedCommunity.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        s/{selectedCommunity.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedCommunity.description}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    Choose a community to post to
                  </div>
                )}
              </button>
              
              {showCommunitySelect && (
                <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                  {communities.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      You haven't joined any communities yet
                    </div>
                  ) : (
                    communities.map((community) => (
                      <button
                        key={community.id}
                        type="button"
                        onClick={() => {
                          setSelectedCommunity(community)
                          handleInputChange('communityId', community.id)
                          setShowCommunitySelect(false)
                        }}
                        className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {community.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900 dark:text-white">
                              s/{community.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {community.description}
                            </div>
                          </div>
                          {community.nsfw && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded">
                              NSFW
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
              
              {errors.communityId && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.communityId}</span>
                </p>
              )}
            </div>
          </div>

          {/* Post Type Selection */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Post Type
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'text')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  form.type === 'text'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-sm font-medium">Text</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('type', 'image')}
                                 disabled={selectedCommunity ? !selectedCommunity.allowImages : false}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  form.type === 'image'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${selectedCommunity && !selectedCommunity.allowImages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Image className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-sm font-medium">Image</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('type', 'link')}
                                 disabled={selectedCommunity ? !selectedCommunity.allowLinks : false}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  form.type === 'link'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${selectedCommunity && !selectedCommunity.allowLinks ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Link className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-sm font-medium">Link</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('type', 'poll')}
                                 disabled={selectedCommunity ? !selectedCommunity.allowPolls : false}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  form.type === 'poll'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${selectedCommunity && !selectedCommunity.allowPolls ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <BarChart3 className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-sm font-medium">Poll</div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Title
            </h2>
            
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="input-field"
              placeholder="Enter your post title..."
              maxLength={300}
            />
            
            {errors.title && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1 mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.title}</span>
              </p>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {form.title.length}/300 characters
            </p>
          </div>

          {/* Content based on type */}
          {form.type === 'text' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Content
              </h2>
              
              <textarea
                value={form.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={8}
                maxLength={40000}
                className="input-field resize-none"
                placeholder="What's on your mind?"
              />
              
              {errors.content && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.content}</span>
                </p>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {form.content.length}/40,000 characters
              </p>
            </div>
          )}

          {form.type === 'image' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Image URL
              </h2>
              
              <input
                type="url"
                value={form.imageUrl || ''}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
              
              {errors.imageUrl && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.imageUrl}</span>
                </p>
              )}
            </div>
          )}

          {form.type === 'link' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Link URL
              </h2>
              
              <input
                type="url"
                value={form.linkUrl || ''}
                onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                className="input-field"
                placeholder="https://example.com"
              />
              
              {errors.linkUrl && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.linkUrl}</span>
                </p>
              )}
            </div>
          )}

          {form.type === 'poll' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Poll Options
              </h2>
              
              <div className="space-y-3">
                {(form.pollOptions || ['', '']).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handlePollOptionChange(index, e.target.value)}
                      className="flex-1 input-field"
                      placeholder={`Option ${index + 1}`}
                      maxLength={100}
                    />
                    {(form.pollOptions || []).length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                {(form.pollOptions || []).length < 6 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                  >
                    + Add Option
                  </button>
                )}
              </div>
              
              {errors.pollOptions && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.pollOptions}</span>
                </p>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Poll Duration (days)
                </label>
                <select
                  value={form.pollDuration || 7}
                  onChange={(e) => handleInputChange('pollDuration', parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>
            </div>
          )}

          {/* Post Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Post Settings
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.nsfw}
                  onChange={(e) => handleInputChange('nsfw', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">NSFW (18+)</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    This post contains content that is not suitable for work
                  </div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.spoiler}
                  onChange={(e) => handleInputChange('spoiler', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Spoiler</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    This post contains spoilers
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="card p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.general}</span>
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !form.communityId || !form.title.trim()}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Create Post</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
} 