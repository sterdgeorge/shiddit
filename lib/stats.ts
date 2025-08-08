import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface SiteStats {
  totalUsers: number
  totalPosts: number
  totalCommunities: number
  totalComments: number
  usersOnline: number // This would need a more sophisticated system for real-time tracking
  verifiedUsers: number
  activeUsers: number // Users active in last 24 hours
}

export const getSiteStats = async (): Promise<SiteStats> => {
  try {
    // Get total users
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const totalUsers = usersSnapshot.size

    // Get verified users
    const verifiedUsersSnapshot = await getDocs(
      query(collection(db, 'users'), where('emailVerified', '==', true))
    )
    const verifiedUsers = verifiedUsersSnapshot.size

    // Get total posts
    const postsSnapshot = await getDocs(collection(db, 'posts'))
    const totalPosts = postsSnapshot.size

    // Get total communities
    const communitiesSnapshot = await getDocs(collection(db, 'communities'))
    const totalCommunities = communitiesSnapshot.size

    // Get total comments (if you have a comments collection)
    let totalComments = 0
    try {
      const commentsSnapshot = await getDocs(collection(db, 'comments'))
      totalComments = commentsSnapshot.size
    } catch (error) {
      // Comments collection might not exist yet
      console.log('Comments collection not found, setting to 0')
    }

    // Get active users (users active in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const activeUsersSnapshot = await getDocs(
      query(
        collection(db, 'users'),
        where('lastActive', '>=', oneDayAgo)
      )
    )
    const activeUsers = activeUsersSnapshot.size

    // For now, estimate users online as 10% of active users
    // In a real app, you'd implement a proper online tracking system
    const usersOnline = Math.max(1, Math.floor(activeUsers * 0.1))

    return {
      totalUsers,
      totalPosts,
      totalCommunities,
      totalComments,
      usersOnline,
      verifiedUsers,
      activeUsers
    }
  } catch (error) {
    console.error('Error fetching site stats:', error)
    // Return default stats if there's an error
    return {
      totalUsers: 0,
      totalPosts: 0,
      totalCommunities: 0,
      totalComments: 0,
      usersOnline: 1,
      verifiedUsers: 0,
      activeUsers: 0
    }
  }
}

export const getCommunityStats = async (communityId: string) => {
  try {
    const communityDoc = await getDocs(
      query(collection(db, 'communities'), where('__name__', '==', communityId))
    )
    
    if (communityDoc.empty) {
      return { memberCount: 0, postCount: 0 }
    }

    const communityData = communityDoc.docs[0].data()
    return {
      memberCount: communityData.memberCount || 0,
      postCount: communityData.postCount || 0
    }
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return { memberCount: 0, postCount: 0 }
  }
}
