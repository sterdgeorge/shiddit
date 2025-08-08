import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase'

export interface UserStats {
  postCount: number
  commentCount: number
  totalUpvotesReceived: number
}

// Calculate user statistics
export const calculateUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // Get user's posts
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId)
    )
    const postsSnapshot = await getDocs(postsQuery)
    
    // Get user's comments
    const commentsQuery = query(
      collection(db, 'comments'),
      where('authorId', '==', userId)
    )
    const commentsSnapshot = await getDocs(commentsQuery)
    
    // Calculate total upvotes received from posts
    let totalUpvotesReceived = 0
    postsSnapshot.forEach((doc) => {
      const data = doc.data()
      totalUpvotesReceived += (data.upvotes?.length || 0)
    })
    
    // Add upvotes from comments
    commentsSnapshot.forEach((doc) => {
      const data = doc.data()
      totalUpvotesReceived += (data.upvotes?.length || 0)
    })
    
    return {
      postCount: postsSnapshot.size,
      commentCount: commentsSnapshot.size,
      totalUpvotesReceived
    }
  } catch (error) {
    console.error('Error calculating user stats:', error)
    return {
      postCount: 0,
      commentCount: 0,
      totalUpvotesReceived: 0
    }
  }
}

// Get top users by total upvotes received
export const getTopUsers = async (limit: number = 5) => {
  try {
    // Get all users
    const usersQuery = query(collection(db, 'users'))
    const usersSnapshot = await getDocs(usersQuery)
    
    // Calculate stats for each user
    const usersWithStats = await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const userData = doc.data()
        const stats = await calculateUserStats(doc.id)
        
        return {
          id: doc.id,
          username: userData.username,
          profilePicture: userData.profilePicture,
          twitterLink: userData.twitterLink,
          totalUpvotesReceived: stats.totalUpvotesReceived
        }
      })
    )
    
    // Sort by total upvotes received and return top users
    return usersWithStats
      .sort((a, b) => b.totalUpvotesReceived - a.totalUpvotesReceived)
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting top users:', error)
    return []
  }
}
