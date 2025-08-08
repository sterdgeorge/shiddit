import { db } from './firebase'
import { 
  collection, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  writeBatch,
  serverTimestamp,
  getDoc,
  increment
} from 'firebase/firestore'

export interface AdminUser {
  id: string
  email: string
  username: string
  isAdmin: boolean
  isBanned: boolean
  banReason?: string
  bannedAt?: Date
  bannedBy?: string
  postKarma: number
  commentKarma: number
  totalKarma: number
  createdAt: Date
  lastActive: Date
}

export interface BanData {
  reason: string
  bannedBy: string
  bannedAt: Date
}

// Admin credentials (you should change these)
export const ADMIN_CREDENTIALS = {
  email: 'admin@shiddit.com',
  password: 'AdminShiddit2025!',
  username: 'ShidditAdmin'
}

// Check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    console.log('Checking admin status for user:', userId)
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const isAdminUser = userData.isAdmin === true
      console.log('User admin status:', { userId, isAdmin: isAdminUser, userData })
      return isAdminUser
    }
    console.log('User document not found:', userId)
    return false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Admin unlimited voting on posts
export const adminVotePost = async (postId: string, userId: string, voteType: 'upvote' | 'downvote' | 'remove', voteCount: number = 1) => {
  try {
    console.log('Admin voting called:', { postId, userId, voteType, voteCount })
    
    // Check if user is admin
    const adminStatus = await isAdmin(userId)
    if (!adminStatus) {
      throw new Error('Only admins can use unlimited voting')
    }

    const postRef = doc(db, 'posts', postId)
    const postDoc = await getDoc(postRef)
    
    if (!postDoc.exists()) {
      throw new Error('Post not found')
    }
    
    const postData = postDoc.data()
    const upvotes = postData.upvotes || []
    const downvotes = postData.downvotes || []
    
    console.log('Current post data:', { upvotes: upvotes.length, downvotes: downvotes.length, score: postData.score })
    
    let newUpvotes = [...upvotes]
    let newDownvotes = [...downvotes]
    
    if (voteType === 'upvote') {
      // Add multiple upvotes (admin can vote multiple times)
      for (let i = 0; i < voteCount; i++) {
        newUpvotes.push(userId)
      }
      console.log(`Added ${voteCount} upvotes by admin ${userId}`)
    } else if (voteType === 'downvote') {
      // Add multiple downvotes (admin can vote multiple times)
      for (let i = 0; i < voteCount; i++) {
        newDownvotes.push(userId)
      }
      console.log(`Added ${voteCount} downvotes by admin ${userId}`)
    } else if (voteType === 'remove') {
      // Remove all votes by this admin
      const beforeUpvotes = newUpvotes.length
      const beforeDownvotes = newDownvotes.length
      newUpvotes = newUpvotes.filter((id: string) => id !== userId)
      newDownvotes = newDownvotes.filter((id: string) => id !== userId)
      console.log(`Removed ${beforeUpvotes - newUpvotes.length} upvotes and ${beforeDownvotes - newDownvotes.length} downvotes by admin ${userId}`)
    }
    
    // Calculate new score
    const newScore = newUpvotes.length - newDownvotes.length
    
    console.log('Updated post data:', { 
      newUpvotes: newUpvotes.length, 
      newDownvotes: newDownvotes.length, 
      newScore,
      scoreChange: newScore - (postData.score || 0)
    })
    
    // Update the post with server timestamp
    await updateDoc(postRef, {
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newScore,
      lastModified: serverTimestamp()
    })
    
    console.log('Post updated successfully')
    
    return {
      id: postId,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newScore,
      adminVoteCount: voteCount
    }
  } catch (error) {
    console.error('Error with admin voting:', error)
    throw error
  }
}

// Admin modify community member count
export const adminModifyCommunityMembers = async (communityId: string, userId: string, newMemberCount: number) => {
  try {
    console.log('Admin modifying community members:', { communityId, userId, newMemberCount })
    
    // Check if user is admin
    const adminStatus = await isAdmin(userId)
    if (!adminStatus) {
      throw new Error('Only admins can modify community member counts')
    }

    const communityRef = doc(db, 'communities', communityId)
    const communityDoc = await getDoc(communityRef)
    
    if (!communityDoc.exists()) {
      throw new Error('Community not found')
    }
    
    // Update the member count with server timestamp
    await updateDoc(communityRef, {
      memberCount: newMemberCount,
      lastModified: serverTimestamp()
    })
    
    console.log('Community member count updated successfully')
    
    return {
      id: communityId,
      memberCount: newMemberCount
    }
  } catch (error) {
    console.error('Error modifying community member count:', error)
    throw error
  }
}

// Admin get community info
export const adminGetCommunity = async (communityId: string) => {
  try {
    const communityRef = doc(db, 'communities', communityId)
    const communityDoc = await getDoc(communityRef)
    
    if (!communityDoc.exists()) {
      throw new Error('Community not found')
    }
    
    const data = communityDoc.data()
    return {
      id: communityDoc.id,
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      creatorId: data.creatorId,
      creatorUsername: data.creatorUsername,
      createdAt: data.createdAt,
      memberCount: data.memberCount || 0,
      imageUrl: data.imageUrl
    }
  } catch (error) {
    console.error('Error getting community:', error)
    throw error
  }
}

// Ban a user
export const banUser = async (userId: string, banData: BanData): Promise<boolean> => {
  try {
    const batch = writeBatch(db)
    
    // Update user document
    const userRef = doc(db, 'users', userId)
    batch.update(userRef, {
      isBanned: true,
      banReason: banData.reason,
      bannedAt: serverTimestamp(),
      bannedBy: banData.bannedBy
    })

    // Delete all user's posts
    const postsQuery = query(collection(db, 'posts'), where('authorId', '==', userId))
    const postsSnapshot = await getDocs(postsQuery)
    postsSnapshot.forEach((postDoc) => {
      batch.delete(postDoc.ref)
    })

    // Delete all user's comments
    const commentsQuery = query(collection(db, 'comments'), where('authorId', '==', userId))
    const commentsSnapshot = await getDocs(commentsQuery)
    commentsSnapshot.forEach((commentDoc) => {
      batch.delete(commentDoc.ref)
    })

    // Delete all user's messages
    const conversationsQuery = query(collection(db, 'conversations'), where('participants', 'array-contains', userId))
    const conversationsSnapshot = await getDocs(conversationsQuery)
    conversationsSnapshot.forEach((conversationDoc) => {
      batch.delete(conversationDoc.ref)
    })

    // Delete user's favorites
    const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', userId))
    const favoritesSnapshot = await getDocs(favoritesQuery)
    favoritesSnapshot.forEach((favoriteDoc) => {
      batch.delete(favoriteDoc.ref)
    })

    await batch.commit()
    return true
  } catch (error) {
    console.error('Error banning user:', error)
    return false
  }
}

// Unban a user
export const unbanUser = async (userId: string, unbannedBy: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      isBanned: false,
      banReason: null,
      bannedAt: null,
      bannedBy: null,
      unbannedBy: unbannedBy,
      unbannedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('Error unbanning user:', error)
    return false
  }
}

// Delete a post
export const deletePost = async (postId: string, deletedBy: string): Promise<boolean> => {
  try {
    const batch = writeBatch(db)
    
    // Delete the post
    const postRef = doc(db, 'posts', postId)
    batch.delete(postRef)
    
    // Delete all comments on the post
    const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId))
    const commentsSnapshot = await getDocs(commentsQuery)
    commentsSnapshot.forEach((commentDoc) => {
      batch.delete(commentDoc.ref)
    })

    // Delete all favorites for the post
    const favoritesQuery = query(collection(db, 'favorites'), where('postId', '==', postId))
    const favoritesSnapshot = await getDocs(favoritesQuery)
    favoritesSnapshot.forEach((favoriteDoc) => {
      batch.delete(favoriteDoc.ref)
    })

    await batch.commit()
    return true
  } catch (error) {
    console.error('Error deleting post:', error)
    return false
  }
}

// Delete a comment
export const deleteComment = async (commentId: string, deletedBy: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'comments', commentId))
    return true
  } catch (error) {
    console.error('Error deleting comment:', error)
    return false
  }
}

// Get all users (for admin panel)
export const getAllUsers = async (): Promise<AdminUser[]> => {
  try {
    const usersQuery = query(collection(db, 'users'))
    const snapshot = await getDocs(usersQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdminUser[]
  } catch (error) {
    console.error('Error getting users:', error)
    return []
  }
}

// Get banned users
export const getBannedUsers = async (): Promise<AdminUser[]> => {
  try {
    const bannedQuery = query(collection(db, 'users'), where('isBanned', '==', true))
    const snapshot = await getDocs(bannedQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdminUser[]
  } catch (error) {
    console.error('Error getting banned users:', error)
    return []
  }
}

// Get user details
export const getUserDetails = async (userId: string): Promise<AdminUser | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as AdminUser
    }
    return null
  } catch (error) {
    console.error('Error getting user details:', error)
    return null
  }
}

// Create admin user (run this once to set up admin)
export const createAdminUser = async (): Promise<boolean> => {
  try {
    // This should be run manually once to create the admin user
    // You would typically do this through a secure admin panel or script
    const adminData = {
      email: ADMIN_CREDENTIALS.email,
      username: ADMIN_CREDENTIALS.username,
      isAdmin: true,
      isBanned: false,
      postKarma: 0,
      commentKarma: 0,
      totalKarma: 0,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    }
    
    // Note: This is just a placeholder. In reality, you'd create the user through Firebase Auth first
    // and then add the admin data to Firestore
    console.log('Admin user data:', adminData)
    return true
  } catch (error) {
    console.error('Error creating admin user:', error)
    return false
  }
}
