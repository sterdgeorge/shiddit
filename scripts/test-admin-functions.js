const { initializeApp } = require('firebase/app')
const { getFirestore, doc, getDoc, updateDoc, collection, getDocs, query, where, serverTimestamp } = require('firebase/firestore')

const firebaseConfig = {
  apiKey: "AIzaSyApezZ6jDvIrw54cZs4ExF4AI2CclYs_K4",
  authDomain: "shiddit-d1ccb.firebaseapp.com",
  databaseURL: "https://shiddit-d1ccb-default-rtdb.firebaseio.com",
  projectId: "shiddit-d1ccb",
  storageBucket: "shiddit-d1ccb.firebasestorage.app",
  messagingSenderId: "929483961055",
  appId: "1:929483961055:web:37abdd1638117d8a1eaf6a",
  measurementId: "G-R4W9HDBFCE"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Admin functions (copied from lib/admin.ts)
async function isAdmin(userId) {
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

async function adminVotePost(postId, userId, voteType, voteCount = 1) {
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
      newUpvotes = newUpvotes.filter((id) => id !== userId)
      newDownvotes = newDownvotes.filter((id) => id !== userId)
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

async function adminModifyCommunityMembers(communityId, userId, newMemberCount) {
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

async function testAdminFunctions() {
  console.log('🔍 Testing Admin Functions...\n')

  try {
    // Get admin user ID
    const usersRef = collection(db, 'users')
    const adminUsersQuery = query(usersRef, where('isAdmin', '==', true))
    const adminUsersSnapshot = await getDocs(adminUsersQuery)
    
    if (adminUsersSnapshot.empty) {
      console.log('❌ No admin users found')
      return
    }

    const adminUser = adminUsersSnapshot.docs[0]
    const adminUserId = adminUser.id
    const adminData = adminUser.data()
    
    console.log(`✅ Using admin user: ${adminData.username} (${adminData.email})`)

    // Test 1: Check admin status
    console.log('\n1. Testing admin status check...')
    const adminStatus = await isAdmin(adminUserId)
    console.log(`Admin status: ${adminStatus}`)

    // Test 2: Test community modification
    console.log('\n2. Testing community modification...')
    const communitiesRef = collection(db, 'communities')
    const communitiesSnapshot = await getDocs(communitiesRef)
    
    if (!communitiesSnapshot.empty) {
      const community = communitiesSnapshot.docs[0]
      const communityId = community.id
      const communityData = community.data()
      
      console.log(`Testing with community: ${communityData.name} (current members: ${communityData.memberCount})`)
      
      const newMemberCount = communityData.memberCount + 10
      console.log(`Attempting to change member count to: ${newMemberCount}`)
      
      try {
        const result = await adminModifyCommunityMembers(communityId, adminUserId, newMemberCount)
        console.log('✅ Community modification successful:', result)
        
        // Verify the change
        const updatedCommunity = await getDoc(doc(db, 'communities', communityId))
        if (updatedCommunity.exists()) {
          const updatedData = updatedCommunity.data()
          console.log(`Verified: Community now has ${updatedData.memberCount} members`)
        }
      } catch (error) {
        console.log('❌ Community modification failed:', error.message)
      }
    }

    // Test 3: Test admin voting
    console.log('\n3. Testing admin voting...')
    const postsRef = collection(db, 'posts')
    const postsSnapshot = await getDocs(postsRef)
    
    if (!postsSnapshot.empty) {
      const post = postsSnapshot.docs[0]
      const postId = post.id
      const postData = post.data()
      
      console.log(`Testing with post: "${postData.title}" (current score: ${postData.score})`)
      
      try {
        const result = await adminVotePost(postId, adminUserId, 'upvote', 5)
        console.log('✅ Admin voting successful:', result)
        
        // Verify the change
        const updatedPost = await getDoc(doc(db, 'posts', postId))
        if (updatedPost.exists()) {
          const updatedData = updatedPost.data()
          console.log(`Verified: Post now has score ${updatedData.score}`)
        }
      } catch (error) {
        console.log('❌ Admin voting failed:', error.message)
      }
    }

  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

// Run the test
testAdminFunctions()
  .then(() => {
    console.log('\n✅ Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
