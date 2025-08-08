import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface FakeStats {
  totalUsers: number
  onlineUsers: number
  totalLikes: number
  totalMembers: number
}

export interface CombinedStats {
  totalUsers: number
  onlineUsers: number
  totalLikes: number
  totalCommunities: number
  totalMembers: number
}

// Get real stats from the database
export const getRealStats = async (): Promise<{
  totalUsers: number
  totalLikes: number
  totalCommunities: number
  totalMembers: number
}> => {
  try {
    // Get users count
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const totalUsers = usersSnapshot.size

    // Get posts and calculate total likes
    const postsSnapshot = await getDocs(collection(db, 'posts'))
    const totalLikes = postsSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data()
      return sum + (data.upvotes?.length || 0)
    }, 0)

    // Get communities count and total members
    const communitiesSnapshot = await getDocs(collection(db, 'communities'))
    const totalCommunities = communitiesSnapshot.size
    const totalMembers = communitiesSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data()
      return sum + (data.memberCount || 0)
    }, 0)

    return {
      totalUsers,
      totalLikes,
      totalCommunities,
      totalMembers
    }
  } catch (error) {
    console.error('Error getting real stats:', error)
    return {
      totalUsers: 0,
      totalLikes: 0,
      totalCommunities: 0,
      totalMembers: 0
    }
  }
}

// Get fake stats from admin collection
export const getFakeStats = async (): Promise<FakeStats> => {
  try {
    const fakeStatsDoc = await getDoc(doc(db, 'admin', 'fakeStats'))
    if (fakeStatsDoc.exists()) {
      const data = fakeStatsDoc.data()
      return {
        totalUsers: data.totalUsers || 0,
        onlineUsers: data.onlineUsers || 0,
        totalLikes: data.totalLikes || 0,
        totalMembers: data.totalMembers || 0
      }
    }
    return {
      totalUsers: 0,
      onlineUsers: 0,
      totalLikes: 0,
      totalMembers: 0
    }
  } catch (error) {
    console.error('Error getting fake stats:', error)
    return {
      totalUsers: 0,
      onlineUsers: 0,
      totalLikes: 0,
      totalMembers: 0
    }
  }
}

// Get combined stats (real + fake)
export const getCombinedStats = async (): Promise<CombinedStats> => {
  const [realStats, fakeStats] = await Promise.all([
    getRealStats(),
    getFakeStats()
  ])

  return {
    totalUsers: realStats.totalUsers + fakeStats.totalUsers,
    onlineUsers: 1 + fakeStats.onlineUsers, // Assume 1 real online user
    totalLikes: realStats.totalLikes + fakeStats.totalLikes,
    totalCommunities: realStats.totalCommunities,
    totalMembers: realStats.totalMembers + fakeStats.totalMembers
  }
}
