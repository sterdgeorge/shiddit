const { initializeApp } = require('firebase/app')
const { getFirestore, doc, getDoc, updateDoc, collection, getDocs, query, where } = require('firebase/firestore')

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

async function testAdminFunctionality() {
  console.log('🔍 Testing Admin Functionality...\n')

  try {
    // Test 1: Check if admin user exists
    console.log('1. Checking admin user...')
    const adminQuery = await getDoc(doc(db, 'users', 'admin@shiddit.com'))
    if (adminQuery.exists()) {
      const adminData = adminQuery.data()
      console.log('✅ Admin user found:', {
        id: adminQuery.id,
        isAdmin: adminData.isAdmin,
        username: adminData.username,
        email: adminData.email
      })
    } else {
      console.log('❌ Admin user not found')
    }

    // Test 2: Check for any user with admin privileges
    console.log('\n2. Checking for any admin users...')
    const usersRef = collection(db, 'users')
    const adminUsersQuery = query(usersRef, where('isAdmin', '==', true))
    const adminUsersSnapshot = await getDocs(adminUsersQuery)
    
    if (!adminUsersSnapshot.empty) {
      console.log('✅ Found admin users:')
      adminUsersSnapshot.forEach(doc => {
        const data = doc.data()
        console.log(`   - ${data.username} (${data.email}) - isAdmin: ${data.isAdmin}`)
      })
    } else {
      console.log('❌ No admin users found')
    }

    // Test 3: Check communities
    console.log('\n3. Checking communities...')
    const communitiesRef = collection(db, 'communities')
    const communitiesSnapshot = await getDocs(communitiesRef)
    
    if (!communitiesSnapshot.empty) {
      console.log('✅ Found communities:')
      communitiesSnapshot.forEach(doc => {
        const data = doc.data()
        console.log(`   - ${data.name}: ${data.memberCount} members`)
      })
    } else {
      console.log('❌ No communities found')
    }

    // Test 4: Check posts
    console.log('\n4. Checking posts...')
    const postsRef = collection(db, 'posts')
    const postsSnapshot = await getDocs(postsRef)
    
    if (!postsSnapshot.empty) {
      console.log('✅ Found posts:')
      postsSnapshot.forEach(doc => {
        const data = doc.data()
        console.log(`   - "${data.title}" by ${data.authorUsername}: ${data.score} points`)
      })
    } else {
      console.log('❌ No posts found')
    }

  } catch (error) {
    console.error('❌ Error during testing:', error)
  }
}

// Run the test
testAdminFunctionality()
  .then(() => {
    console.log('\n✅ Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
