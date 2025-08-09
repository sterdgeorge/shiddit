'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { collection, addDoc, serverTimestamp, query, where, getDocs, getDoc, doc, updateDoc, increment, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import rateLimiter, { RATE_LIMITS } from '@/lib/rateLimit'
import { uploadPostMedia, getRemainingMediaUploads } from '@/lib/postMedia'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import RequireVerification from '@/components/auth/RequireVerification'
import { MessageSquare, Image, Link, BarChart3, AlertCircle, Users, X, Upload, Video, FileImage } from 'lucide-react'

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
  imageUrl?: string
  videoUrl?: string
  pollOptions?: string[]
  pollDuration?: number
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
    content: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [showCommunitySelect, setShowCommunitySelect] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)

  // Check if user can create posts
  const canCreatePost = () => {
    if (!user) return false
    
    const rateLimitKey = `post_creation_${user.uid}`
    return rateLimiter.checkRateLimit(
      rateLimitKey,
      RATE_LIMITS.POST_CREATION.maxActions,
      RATE_LIMITS.POST_CREATION.windowMs
    )
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
        
        console.log('User community memberships:', communityIds)
        
        if (communityIds.length === 0) {
          console.log('No community memberships found for user')
          return
        }
        
        const communitiesData: Community[] = []
        for (const communityId of communityIds) {
          try {
            const communityDoc = await getDoc(doc(db, 'communities', communityId))
            
            if (communityDoc.exists()) {
              const data = communityDoc.data()
              communitiesData.push({
                id: communityDoc.id,
                name: data.name,
                displayName: data.displayName,
                description: data.description,
                type: data.type || 'public',
                nsfw: data.nsfw || false,
                allowImages: data.allowImages !== false,
                allowLinks: data.allowLinks !== false,
                allowPolls: data.allowPolls !== false
              })
            }
          } catch (error) {
            console.error('Error fetching community:', communityId, error)
          }
        }
        
        console.log('Found communities for user:', communitiesData.map(c => c.name))
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

    if (!form.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (form.content.length > 40000) {
      newErrors.content = 'Content must be 40,000 characters or less'
    }

    if (form.pollOptions && form.pollOptions.length > 0) {
      if (form.pollOptions.length < 2) {
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

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return

    const file = event.target.files[0]
    setUploadingMedia(true)
    setErrors({})

    try {
      // Create a temporary post ID for upload
      const tempPostId = `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      const result = await uploadPostMedia(user.uid, tempPostId, file)
      
      if (result.success && result.url) {
        setMediaFile(file)
        setMediaPreview(result.url)
        
        // Determine if it's a video or image based on file type
        const isVideo = file.type.startsWith('video/')
        
        setForm(prev => ({
          ...prev,
          imageUrl: isVideo ? undefined : result.url,
          videoUrl: isVideo ? result.url : undefined
        }))
        setErrors({})
      } else {
        setErrors({ imageUrl: result.error || 'Failed to upload media' })
      }
    } catch (error) {
      console.error('Error uploading media:', error)
      setErrors({ imageUrl: 'Failed to upload media. Please try again.' })
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleRemoveMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setForm(prev => ({
      ...prev,
      imageUrl: undefined,
      videoUrl: undefined
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !userProfile) {
      showLoginPopup()
      return
    }

    // Security checks
    if (!canCreatePost()) {
      const rateLimitKey = `post_creation_${user.uid}`
      const remainingTime = rateLimiter.getTimeUntilReset(
        rateLimitKey,
        RATE_LIMITS.POST_CREATION.windowMs
      )
      const minutes = Math.ceil(remainingTime / (60 * 1000))
      setErrors({ general: `You can only create ${RATE_LIMITS.POST_CREATION.maxActions} posts per hour. Please wait ${minutes} minutes before creating another.` })
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
      // Ensure user document exists before creating post
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        const userProfileData = {
          uid: user.uid,
          email: user.email || '',
          username: userProfile.username || user.displayName || 'user',
          displayName: user.displayName || userProfile.username || 'User',
          bio: '',
          avatar: '',
          createdAt: serverTimestamp(),
          friends: [],
          isAdmin: false,
          postKarma: 0,
          commentKarma: 0,
          totalKarma: 0,
          emailVerified: user.emailVerified,
        }
        
        await setDoc(userDocRef, userProfileData)
        console.log('Created missing user document for:', user.uid)
      }

      // Create post
      const postData: any = {
        title: form.title.trim(),
        content: form.content.trim(),
        authorId: user.uid,
        authorUsername: userProfile.username || user.displayName || 'user',
        communityId: selectedCommunity.id,
        communityName: selectedCommunity.name,
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

      // Add optional media and poll data
      if (form.imageUrl) {
        postData.imageUrl = form.imageUrl.trim()
      }
      if (form.videoUrl) {
        postData.videoUrl = form.videoUrl.trim()
      }
      if (form.pollOptions && form.pollOptions.length > 0) {
        postData.pollOptions = form.pollOptions.map(option => ({
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

      // Rate limiting is handled by the rateLimiter utility

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
      <RequireVerification>
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

           {/* Body */}
           <div className="card p-6">
             <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               Body
             </h2>
             
             <textarea
               value={form.content}
               onChange={(e) => handleInputChange('content', e.target.value)}
               rows={8}
               maxLength={40000}
               className="input-field resize-none"
               placeholder="What's on your mind? You can include links in your text."
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

           {/* Media Upload */}
           <div className="card p-6">
             <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               Add Media (Optional)
             </h2>
             
             <div className="space-y-4">
               {/* Media Preview */}
               {mediaPreview && (
                 <div className="relative">
                   {mediaFile?.type.startsWith('video/') ? (
                     <video 
                       src={mediaPreview} 
                       controls 
                       className="w-full max-h-96 rounded-lg"
                     />
                   ) : (
                     <img 
                       src={mediaPreview} 
                       alt="Preview" 
                       className="w-full max-h-96 object-contain rounded-lg"
                     />
                   )}
                   <button
                     type="button"
                     onClick={handleRemoveMedia}
                     className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               )}

               {/* Upload Section */}
               {!mediaPreview && (
                 <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                   <div className="space-y-4">
                     <div className="flex justify-center space-x-4">
                       <div className="flex items-center space-x-2">
                         <FileImage className="w-6 h-6 text-orange-500" />
                         <span className="text-sm font-medium">Images</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <Video className="w-6 h-6 text-orange-500" />
                         <span className="text-sm font-medium">Videos</span>
                       </div>
                     </div>
                     
                     <div>
                       <button
                         type="button"
                         onClick={() => document.getElementById('media-upload')?.click()}
                         disabled={uploadingMedia}
                         className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                       >
                         {uploadingMedia ? (
                           <LoadingSpinner />
                         ) : (
                           <Upload className="w-4 h-4" />
                         )}
                         <span>{uploadingMedia ? 'Uploading...' : 'Upload Media'}</span>
                       </button>
                     </div>
                     
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                       Supports JPEG, PNG, GIF, WebP, MP4, WebM, OGG • Max 10MB images, 50MB videos • Videos up to 10 seconds
                     </p>
                     
                     {user && (
                       <p className="text-xs text-gray-400 dark:text-gray-500">
                         {getRemainingMediaUploads(user.uid)} uploads remaining this hour
                       </p>
                     )}
                   </div>
                 </div>
               )}

               {/* Hidden file input */}
               <input
                 id="media-upload"
                 type="file"
                 accept="image/*,video/*"
                 onChange={handleMediaUpload}
                 className="hidden"
                 disabled={uploadingMedia}
               />
             </div>
             
             {errors.imageUrl && (
               <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1 mt-2">
                 <AlertCircle className="w-4 h-4" />
                 <span>{errors.imageUrl}</span>
               </p>
             )}
           </div>

           {/* Poll Options */}
           <div className="card p-6">
             <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
               Add Poll (Optional)
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
    </RequireVerification>
    </MainLayout>
  )
} 