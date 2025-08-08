import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { uploadImage, deleteImage } from './cloudinary'
import rateLimiter, { RATE_LIMITS } from './rateLimit'

export interface ProfilePictureUploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload profile picture to Cloudinary
 * @param userId - User ID
 * @param file - Image file to upload
 * @returns Promise with upload result
 */
export const uploadProfilePicture = async (
  userId: string,
  file: File
): Promise<ProfilePictureUploadResult> => {
  try {
    console.log('Starting profile picture upload for user:', userId)
    console.log('File:', file.name, file.size, file.type)
    
    // Validate file
    if (!file) {
      return {
        success: false,
        error: 'No file provided'
      }
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image'
      }
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image size must be less than 5MB'
      }
    }

    // Upload to Cloudinary
    console.log('Uploading file to Cloudinary...')
    const imageUrl = await uploadImage(file, `users/${userId}/profile`)
    console.log('Image uploaded successfully:', imageUrl)

    // Update user profile in Firestore
    console.log('Updating user profile in Firestore...')
    await updateDoc(doc(db, 'users', userId), {
      profilePicture: imageUrl
    })
    console.log('User profile updated successfully')

    return {
      success: true,
      url: imageUrl
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    return {
      success: false,
      error: `Failed to upload profile picture: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Delete profile picture from Cloudinary
 * @param userId - User ID
 * @param currentPictureUrl - Current profile picture URL
 * @returns Promise with deletion result
 */
export const deleteProfilePicture = async (
  userId: string,
  currentPictureUrl?: string
): Promise<ProfilePictureUploadResult> => {
  try {
    // Rate limiting check
    const rateLimitKey = `profile_picture_${userId}`
    const isAllowed = rateLimiter.checkRateLimit(
      rateLimitKey,
      RATE_LIMITS.PROFILE_PICTURE_CHANGE.maxActions,
      RATE_LIMITS.PROFILE_PICTURE_CHANGE.windowMs
    )

    if (!isAllowed) {
      const remainingTime = rateLimiter.getTimeUntilReset(
        rateLimitKey,
        RATE_LIMITS.PROFILE_PICTURE_CHANGE.windowMs
      )
      const minutes = Math.ceil(remainingTime / (60 * 1000))
      return {
        success: false,
        error: `You can only change your profile picture ${RATE_LIMITS.PROFILE_PICTURE_CHANGE.maxActions} times per hour. Please wait ${minutes} minutes.`
      }
    }

    // Delete from Cloudinary if URL exists
    if (currentPictureUrl && currentPictureUrl.includes('cloudinary.com')) {
      try {
        // Extract public ID from Cloudinary URL
        const urlParts = currentPictureUrl.split('/')
        const publicId = urlParts[urlParts.length - 1].split('.')[0]
        await deleteImage(publicId)
      } catch (cloudinaryError) {
        console.warn('Failed to delete old profile picture from Cloudinary:', cloudinaryError)
        // Continue with Firestore update even if Cloudinary deletion fails
      }
    }

    // Update user profile in Firestore
    await updateDoc(doc(db, 'users', userId), {
      profilePicture: null
    })

    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting profile picture:', error)
    return {
      success: false,
      error: 'Failed to delete profile picture. Please try again.'
    }
  }
}

/**
 * Get remaining profile picture changes for a user
 * @param userId - User ID
 * @returns Number of remaining changes
 */
export const getRemainingProfilePictureChanges = (userId: string): number => {
  const rateLimitKey = `profile_picture_${userId}`
  return rateLimiter.getRemainingActions(
    rateLimitKey,
    RATE_LIMITS.PROFILE_PICTURE_CHANGE.maxActions,
    RATE_LIMITS.PROFILE_PICTURE_CHANGE.windowMs
  )
}

/**
 * Get time until profile picture rate limit resets
 * @param userId - User ID
 * @returns Milliseconds until reset
 */
export const getProfilePictureRateLimitResetTime = (userId: string): number => {
  const rateLimitKey = `profile_picture_${userId}`
  return rateLimiter.getTimeUntilReset(
    rateLimitKey,
    RATE_LIMITS.PROFILE_PICTURE_CHANGE.windowMs
  )
}
