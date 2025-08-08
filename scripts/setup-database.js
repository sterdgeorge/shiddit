const { initializeApp } = require('firebase/app')
const { getFirestore, collection, doc, setDoc, getDocs, query, where } = require('firebase/firestore')

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

async function setupDatabase() {
  console.log('Setting up Firebase database...')

  try {
    // Check if communities exist
    const communitiesSnapshot = await getDocs(collection(db, 'communities'))
    console.log(`Found ${communitiesSnapshot.size} existing communities`)

    if (communitiesSnapshot.empty) {
      console.log('Creating sample communities...')
      
      // Create a sample community
      const sampleCommunity = {
        name: 'general',
        displayName: 'General',
        description: 'A place for general discussion about anything and everything.',
        creatorId: 'system',
        creatorUsername: 'system',
        createdAt: new Date(),
        memberCount: 1,
        postCount: 0,
        members: ['system'],
        type: 'public',
        nsfw: false,
        imageUrl: null
      }

      await setDoc(doc(db, 'communities', 'general'), sampleCommunity)
      console.log('Created sample community: general')
    }

    // Check if users exist
    const usersSnapshot = await getDocs(collection(db, 'users'))
    console.log(`Found ${usersSnapshot.size} existing users`)

    // Create sample posts if none exist
    const postsSnapshot = await getDocs(collection(db, 'posts'))
    console.log(`Found ${postsSnapshot.size} existing posts`)

    if (postsSnapshot.empty && !communitiesSnapshot.empty) {
      console.log('Creating sample posts...')
      
      const samplePost = {
        title: 'Welcome to Shiddit!',
        content: 'Welcome to our community! This is a place where you can share your thoughts, ideas, and engage with others. Feel free to create posts, comment, and join communities that interest you.',
        authorId: 'system',
        authorUsername: 'system',
        communityId: communitiesSnapshot.docs[0].id,
        communityName: communitiesSnapshot.docs[0].data().name,
        score: 1,
        upvotes: ['system'],
        downvotes: [],
        commentCount: 0,
        type: 'text',
        createdAt: new Date()
      }

      await setDoc(doc(db, 'posts', 'welcome-post'), samplePost)
      console.log('Created sample post: Welcome to Shiddit!')
    }

    console.log('Database setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Deploy Firestore indexes: firebase deploy --only firestore:indexes')
    console.log('2. Deploy storage rules: firebase deploy --only storage')
    console.log('3. Deploy Firestore rules: firebase deploy --only firestore:rules')

  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

setupDatabase()
