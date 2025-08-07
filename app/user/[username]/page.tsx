'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PostCard from '@/components/feed/PostCard'
import Button from '@/components/ui/Button'
import { Camera, Edit3, Twitter, Globe, Calendar, MessageSquare, Heart, Users, Settings } from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  email: string
  bio?: string
  profilePicture?: string
  twitterLink?: string
  websiteLink?: string
  createdAt: Date
  postKarma: number
  commentKarma: number
  totalKarma: number
  isAdmin: boolean
}

interface UserPost {
  id: string
  title: string
  content: string
  authorId: string
  authorUsername: string
  communityId: string
  communityName: string
  likes: number
  comments: number
  createdAt: Date
  imageUrl?: string
}

interface UserCommunity {
  id: string
  name: string
  description: string
  memberCount: number
  joinedAt: Date
}

export default function UserProfilePage() {
  const params = useParams()
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<UserPost[]>([])
  const [communities, setCommunities] = useState<UserCommunity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'communities'>('posts')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: '',
    twitterLink: '',
    websiteLink: ''
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  const username = params.username as string

  useEffect(() => {
    if (!username) return

    const fetchProfile = async () => {
      try {
        // Fetch user profile
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '==', username)
        )
        
        const snapshot = await onSnapshot(usersQuery, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]
            const data = doc.data()
            setProfile({
              id: doc.id,
              username: data.username,
              email: data.email,
              bio: data.bio,
              profilePicture: data.profilePicture,
              twitterLink: data.twitterLink,
              websiteLink: data.websiteLink,
              createdAt: data.createdAt?.toDate() || new Date(),
              postKarma: data.postKarma || 0,
              commentKarma: data.commentKarma || 0,
              totalKarma: data.totalKarma || 0,
              isAdmin: data.isAdmin || false
            })
            
            setEditForm({
              bio: data.bio || '',
              twitterLink: data.twitterLink || '',
              websiteLink: data.websiteLink || ''
            })
          }
          setLoading(false)
        })

        return () => snapshot()
      } catch (error) {
        console.error('Error fetching profile:', error)
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  useEffect(() => {
    if (!profile) return

    // Fetch user's posts
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', profile.id),
      orderBy('createdAt', 'desc')
    )

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData: UserPost[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        postsData.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          authorId: data.authorId,
          authorUsername: data.authorUsername,
          communityId: data.communityId,
          communityName: data.communityName,
          likes: data.likes || 0,
          comments: data.comments || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          imageUrl: data.imageUrl
        })
      })
      setPosts(postsData)
    })

    return () => unsubscribePosts()
  }, [profile])

  useEffect(() => {
    if (!profile) return

    // Fetch user's communities
    const communitiesQuery = query(
      collection(db, 'communityMembers'),
      where('userId', '==', profile.id)
    )

    const unsubscribeCommunities = onSnapshot(communitiesQuery, async (snapshot) => {
      const communitiesData: UserCommunity[] = []
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data()
        try {
          const communityDoc = await getDoc(doc(db, 'communities', data.communityId))
          if (communityDoc.exists()) {
            const communityData = communityDoc.data()
            communitiesData.push({
              id: communityDoc.id,
              name: communityData.name,
              description: communityData.description,
              memberCount: communityData.memberCount || 0,
              joinedAt: data.joinedAt?.toDate() || new Date()
            })
          }
        } catch (error) {
          console.error('Error fetching community:', error)
        }
      }
      
      setCommunities(communitiesData)
    })

    return () => unsubscribeCommunities()
  }, [profile])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !profile) return

    const file = event.target.files[0]
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      // For now, we'll use a placeholder URL
      // In production, you'd upload to Firebase Storage
      const imageUrl = URL.createObjectURL(file)
      
      await updateDoc(doc(db, 'users', profile.id), {
        profilePicture: imageUrl
      })
      
      alert('Profile picture updated successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    try {
      await updateDoc(doc(db, 'users', profile.id), {
        bio: editForm.bio.trim(),
        twitterLink: editForm.twitterLink.trim(),
        websiteLink: editForm.websiteLink.trim()
      })
      
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
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

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            User Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The user "{username}" doesn't exist or has been deleted.
          </p>
        </div>
      </MainLayout>
    )
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          {/* Cover Image Placeholder */}
          <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500 rounded-t-lg"></div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end space-x-4 -mt-16">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 bg-orange-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center overflow-hidden">
                  {profile.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt={profile.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl font-bold">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {isOwnProfile && (
                  <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>
              
              {/* Profile Details */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.username}
                  </h1>
                  {profile.isAdmin && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {profile.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{posts.length} posts</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{profile.totalKarma} karma</span>
                  </div>
                </div>
                
                {/* Social Links */}
                {(profile.twitterLink || profile.websiteLink) && (
                  <div className="flex items-center space-x-3">
                    {profile.twitterLink && (
                      <a
                        href={profile.twitterLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                    {profile.websiteLink && (
                      <a
                        href={profile.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm">Website</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {isOwnProfile ? (
                  <>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="secondary"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/settings'}
                      variant="secondary"
                      size="sm"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        if (!user) {
                          showLoginPopup()
                        } else {
                          // Start conversation logic
                          window.location.href = `/messages`
                        }
                      }}
                      size="sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {/* Bio */}
            {profile.bio && (
              <div className="mt-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Profile
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="input-field resize-none"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {editForm.bio.length}/500 characters
                </p>
              </div>
              
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Twitter Link
                </label>
                <input
                  id="twitter"
                  type="url"
                  value={editForm.twitterLink}
                  onChange={(e) => setEditForm({ ...editForm, twitterLink: e.target.value })}
                  className="input-field"
                  placeholder="https://twitter.com/username"
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  value={editForm.websiteLink}
                  onChange={(e) => setEditForm({ ...editForm, websiteLink: e.target.value })}
                  className="input-field"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button onClick={handleSaveProfile}>
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('communities')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'communities'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Communities ({communities.length})
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'posts' ? (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No posts yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? 'Start sharing your thoughts with the community!' : 'This user hasn\'t posted anything yet.'}
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {communities.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No communities yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {isOwnProfile ? 'Join some communities to get started!' : 'This user hasn\'t joined any communities yet.'}
                    </p>
                  </div>
                ) : (
                  communities.map((community) => (
                    <div
                      key={community.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {community.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            s/{community.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {community.memberCount} members
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Joined {community.joinedAt.toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 