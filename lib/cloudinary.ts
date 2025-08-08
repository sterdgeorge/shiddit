// Simple Cloudinary upload using unsigned uploads with upload preset
export const uploadImage = async (file: File, folder: string = 'shiddit'): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('Uploading to Cloudinary:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder: folder
    })
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'shiddit_uploads')
    formData.append('folder', folder)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`
    console.log('Upload URL:', uploadUrl)

    fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        console.log('Upload response status:', response.status)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        console.log('Upload response data:', data)
        if (data.secure_url) {
          resolve(data.secure_url)
        } else {
          reject(new Error(`Upload failed: ${data.error?.message || 'No URL returned'}`))
        }
      })
      .catch(error => {
        console.error('Upload error:', error)
        reject(new Error(`Upload failed: ${error.message}`))
      })
  })
}

// Upload video to Cloudinary
export const uploadVideo = async (file: File, folder: string = 'shiddit'): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('Uploading video to Cloudinary:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder: folder
    })
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'shiddit_uploads')
    formData.append('folder', folder)
    formData.append('resource_type', 'video')

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`
    console.log('Video upload URL:', uploadUrl)

    fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        console.log('Video upload response status:', response.status)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        console.log('Video upload response data:', data)
        if (data.secure_url) {
          resolve(data.secure_url)
        } else {
          reject(new Error(`Video upload failed: ${data.error?.message || 'No URL returned'}`))
        }
      })
      .catch(error => {
        console.error('Video upload error:', error)
        reject(new Error(`Video upload failed: ${error.message}`))
      })
  })
}

// Smart upload function that detects file type
export const uploadMedia = async (file: File, folder: string = 'shiddit'): Promise<string> => {
  const isVideo = file.type.startsWith('video/')
  if (isVideo) {
    return uploadVideo(file, folder)
  } else {
    return uploadImage(file, folder)
  }
}

// Delete media from Cloudinary (client-side only)
export const deleteImage = async (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.warn('Image deletion not implemented for client-side. Image will remain in Cloudinary.')
    resolve()
  })
}
