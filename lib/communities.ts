import { doc, getDoc, updateDoc, increment, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface Community {
  id: string
  name: string
  displayName: string
  description: string
  creatorId: string
  creatorUsername: string
  createdAt: Date
  memberCount: number
}

// Join a community
export const joinCommunity = async (communityId: string, userId: string, username: string) => {
  try {
    // Check if user is already a member
    const membershipQuery = query(
      collection(db, 'communityMembers'),
      where('userId', '==', userId),
      where('communityId', '==', communityId)
    )
    const membershipSnapshot = await getDocs(membershipQuery)
    
    if (!membershipSnapshot.empty) {
      throw new Error('You are already a member of this community')
    }

    // Create membership record
    await addDoc(collection(db, 'communityMembers'), {
      userId: userId,
      communityId: communityId,
      username: username,
      joinedAt: new Date()
    })

    // Update community member count
    await updateDoc(doc(db, 'communities', communityId), {
      memberCount: increment(1)
    })

    return { success: true }
  } catch (error) {
    console.error('Error joining community:', error)
    throw error
  }
}

// Leave a community
export const leaveCommunity = async (communityId: string, userId: string) => {
  try {
    // Find and delete membership record
    const membershipQuery = query(
      collection(db, 'communityMembers'),
      where('userId', '==', userId),
      where('communityId', '==', communityId)
    )
    const membershipSnapshot = await getDocs(membershipQuery)
    
    if (membershipSnapshot.empty) {
      throw new Error('You are not a member of this community')
    }

    // Delete all membership records (should only be one)
    const deletePromises = membershipSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    // Update community member count
    await updateDoc(doc(db, 'communities', communityId), {
      memberCount: increment(-1)
    })

    return { success: true }
  } catch (error) {
    console.error('Error leaving community:', error)
    throw error
  }
}

// Check if user is a member of a community
export const isCommunityMember = async (communityId: string, userId: string): Promise<boolean> => {
  try {
    const membershipQuery = query(
      collection(db, 'communityMembers'),
      where('userId', '==', userId),
      where('communityId', '==', communityId)
    )
    const membershipSnapshot = await getDocs(membershipQuery)
    return !membershipSnapshot.empty
  } catch (error) {
    console.error('Error checking community membership:', error)
    return false
  }
}

// Get user's communities
export const getUserCommunities = async (userId: string): Promise<Community[]> => {
  try {
    const membershipQuery = query(
      collection(db, 'communityMembers'),
      where('userId', '==', userId)
    )
    const membershipSnapshot = await getDocs(membershipQuery)
    
    const communityIds = membershipSnapshot.docs.map(doc => doc.data().communityId)
    const communities: Community[] = []
    
    for (const communityId of communityIds) {
      const communityDoc = await getDoc(doc(db, 'communities', communityId))
      if (communityDoc.exists()) {
        const data = communityDoc.data()
        communities.push({
          id: communityDoc.id,
          name: data.name,
          displayName: data.displayName,
          description: data.description,
          creatorId: data.creatorId,
          creatorUsername: data.creatorUsername,
          createdAt: data.createdAt?.toDate() || new Date(),
          memberCount: data.memberCount || 0
        })
      }
    }
    
    return communities
  } catch (error) {
    console.error('Error getting user communities:', error)
    return []
  }
}
