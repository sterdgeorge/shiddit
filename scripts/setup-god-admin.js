const { initializeApp } = require('firebase/app')
const { getFirestore, doc, updateDoc, getDoc, collection, query, getDocs, where } = require('firebase/firestore')

// Your Firebase config (copied from lib/firebase.ts)
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

async function setupGodAdmin() {
  try {
    console.log('Setting up god user with admin powers...')

    // First, let's find the user with username "god"
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', 'god'))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.log('User "god" not found. Please create the user first.')
      return
    }

    const godUser = querySnapshot.docs[0]
    const userId = godUser.id

    console.log(`Found user "god" with ID: ${userId}`)

    // Update the user to have admin powers and verification
    await updateDoc(doc(db, 'users', userId), {
      isAdmin: true,
      isPremium: true,
      isVerified: true,
      adminLevel: 'super',
      canDeletePosts: true,
      canBanUsers: true,
      canManageCommunities: true,
      adminGrantedAt: new Date(),
      adminGrantedBy: 'system',
      premiumSince: new Date(),
      verificationStatus: 'verified'
    })

    console.log('✅ User "god" has been granted admin powers and verification!')
    console.log('Admin capabilities:')
    console.log('- Can delete posts')
    console.log('- Can ban users')
    console.log('- Can manage communities')
    console.log('- Premium verification status')
    console.log('- Super admin level')

  } catch (error) {
    console.error('Error setting up god admin:', error)
  }
}

// Run the setup
setupGodAdmin()
