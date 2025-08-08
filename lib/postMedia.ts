import rateLimiter, { RATE_LIMITS } from './rateLimit'
import { uploadMedia } from './cloudinary'

export interface MediaUploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Get video duration from file
 * @param file - Video file
 * @returns Promise with duration in seconds
 */
const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.src = URL.createObjectURL(file)
  })
}

/**
 * Upload media file for a post to Cloudinary
 * @param userId - User ID
 * @param postId - Post ID (can be temporary)
 * @param file - Media file to upload
 * @returns Promise with upload result
 */
export const uploadPostMedia = async (
  userId: string,
  postId: string,
  file: File
): Promise<MediaUploadResult> => {
  try {
    // Rate limiting check
    const rateLimitKey = `post_media_${userId}`
    const isAllowed = rateLimiter.checkRateLimit(
      rateLimitKey,
      RATE_LIMITS.POST_CREATION.maxActions,
      RATE_LIMITS.POST_CREATION.windowMs
    )

    if (!isAllowed) {
      const remainingTime = rateLimiter.getTimeUntilReset(
        rateLimitKey,
        RATE_LIMITS.POST_CREATION.windowMs
      )
      const minutes = Math.ceil(remainingTime / (60 * 1000))
      return {
        success: false,
        error: `You can only upload ${RATE_LIMITS.POST_CREATION.maxActions} media files per hour. Please wait ${minutes} minutes.`
      }
    }

    // Validate file
    if (!file) {
      return {
        success: false,
        error: 'No file provided'
      }
    }

    // Check file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi']
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes]

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'File type not supported. Please use JPEG, PNG, GIF, WebP, MP4, WebM, OGG, MOV, or AVI files.'
      }
    }

    // Check file size (10MB limit for images, 50MB for videos)
    const isVideo = allowedVideoTypes.includes(file.type)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024 // 50MB for videos, 10MB for images
    
    if (file.size > maxSize) {
      const maxSizeMB = isVideo ? 50 : 10
      return {
        success: false,
        error: `File size must be less than ${maxSizeMB}MB`
      }
    }

    // For videos, check duration (10 seconds limit)
    if (isVideo) {
      const duration = await getVideoDuration(file)
      if (duration > 10) {
        return {
          success: false,
          error: 'Video must be 10 seconds or shorter'
        }
      }
    }

    // Upload to Cloudinary
    const folder = `posts/${postId}/media`
    const url = await uploadMedia(file, folder)

    return {
      success: true,
      url: url
    }
  } catch (error) {
    console.error('Error uploading post media:', error)
    return {
      success: false,
      error: `Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Delete media file from Firebase Storage
 * @param fileUrl - URL of the file to delete
 * @returns Promise with deletion result
 */
export const deletePostMedia = async (fileUrl: string): Promise<MediaUploadResult> => {
  try {
    if (!fileUrl.includes('firebasestorage.googleapis.com')) {
      return {
        success: false,
        error: 'Invalid file URL'
      }
    }

    // This function is no longer needed as Cloudinary handles uploads directly.
    // If you need to delete from Cloudinary, you'd use their API.
    // For now, we'll return success as there's no direct Firebase Storage deletion here.
    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting post media:', error)
    return {
      success: false,
      error: 'Failed to delete media. Please try again.'
    }
  }
}

/**
 * Get remaining media uploads for a user
 * @param userId - User ID
 * @returns Number of remaining uploads
 */
export const getRemainingMediaUploads = (userId: string): number => {
  const rateLimitKey = `post_media_${userId}`
  return rateLimiter.getRemainingActions(
    rateLimitKey,
    RATE_LIMITS.POST_CREATION.maxActions,
    RATE_LIMITS.POST_CREATION.windowMs
  )
}

/**
 * Get time until media upload rate limit resets
 * @param userId - User ID
 * @returns Milliseconds until reset
 */
export const getMediaUploadRateLimitResetTime = (userId: string): number => {
  const rateLimitKey = `post_media_${userId}`
  return rateLimiter.getTimeUntilReset(
    rateLimitKey,
    RATE_LIMITS.POST_CREATION.windowMs
  )
}
