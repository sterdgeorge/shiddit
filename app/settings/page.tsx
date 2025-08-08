'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadProfilePicture, deleteProfilePicture, getRemainingProfilePictureChanges } from '@/lib/profilePicture'
import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import { Sun, Moon, User, Save, Camera, X } from 'lucide-react'
import DefaultProfilePicture from '@/components/ui/DefaultProfilePicture'
import { calculateUserStats } from '@/lib/userStats'

export default function SettingsPage() {
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const { theme, toggleTheme } = useTheme()
  
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [remainingChanges, setRemainingChanges] = useState(3)
  const [userStats, setUserStats] = useState({
    postCount: 0,
    commentCount: 0,
    totalUpvotesReceived: 0
  })


  useEffect(() => {
    if (userProfile) {
      setBio(userProfile.bio || '')
    }
    if (user) {
      setRemainingChanges(getRemainingProfilePictureChanges(user.uid))
    }
  }, [userProfile, user])

  useEffect(() => {
    if (user) {
      const fetchUserStats = async () => {
        const stats = await calculateUserStats(user.uid)
        setUserStats(stats)
      }
      fetchUserStats()
    }
  }, [user])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return

    const file = event.target.files[0]
    setUploadingImage(true)
    setMessage('')
    
    try {
      const result = await uploadProfilePicture(user.uid, file)
      
      if (result.success) {
        setMessage('Profile picture updated successfully!')
        setRemainingChanges(getRemainingProfilePictureChanges(user.uid))
      } else {
        setMessage(result.error || 'Failed to upload image. Please try again.')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!user || !userProfile?.profilePicture) return

    setUploadingImage(true)
    setMessage('')
    
    try {
      const result = await deleteProfilePicture(user.uid, userProfile.profilePicture)
      
      if (result.success) {
        setMessage('Profile picture removed successfully!')
        setRemainingChanges(getRemainingProfilePictureChanges(user.uid))
      } else {
        setMessage(result.error || 'Failed to remove image. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      setMessage('Failed to remove image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        bio: bio.trim()
      })
      setMessage('Profile updated successfully!')
    } catch (error) {
      setMessage('Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }



  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access settings
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and profile
          </p>
        </div>

        {/* Theme Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose between light and dark mode
              </p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="text-sm">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="text-sm">Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile
          </h2>
          
          <div className="space-y-4">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-white dark:border-gray-800 overflow-hidden rounded-full">
                    {userProfile?.profilePicture ? (
                      <img 
                        src={userProfile.profilePicture} 
                        alt={userProfile.username} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, show default
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <DefaultProfilePicture 
                      username={userProfile?.username || 'User'} 
                      size="lg" 
                      className={userProfile?.profilePicture ? 'hidden' : ''}
                    />
                  </div>
                  
                  <label className="absolute -bottom-1 -right-1 bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-full cursor-pointer transition-colors shadow-lg border-2 border-white dark:border-gray-800">
                    <Camera className="w-3 h-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={() => document.getElementById('profile-picture-input')?.click()}
                      disabled={uploadingImage}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </button>
                    {userProfile?.profilePicture && (
                      <button
                        onClick={handleDeleteImage}
                        disabled={uploadingImage}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {remainingChanges} changes remaining this hour • Max 5MB
                  </p>
                </div>
              </div>
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={userProfile?.username || ''}
                disabled
                className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Username cannot be changed
              </p>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={userProfile?.email || ''}
                disabled
                className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                className="input-field resize-none"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {bio.length}/500 characters
              </p>
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}>
                {message}
              </div>
            )}
            
            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </div>

        {/* Account Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Information
          </h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Member since:</span>
              <span className="text-gray-900 dark:text-white">
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Shit posts:</span>
              <span className="text-gray-900 dark:text-white">
                {userStats.postCount}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Comment Shit:</span>
              <span className="text-gray-900 dark:text-white">
                {userStats.commentCount}
              </span>
            </div>
            
                             <div className="flex justify-between">
                   <span className="text-gray-600 dark:text-gray-400">Upvotes received:</span>
                   <span className="text-gray-900 dark:text-white">
                     {userStats.totalUpvotesReceived}
                   </span>
                 </div>
          </div>
        </div>


      </div>
    </MainLayout>
  )
} 