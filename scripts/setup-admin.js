// Script to set up admin user in Firebase
// Run this script once to create the admin user

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'

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

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const ADMIN_CREDENTIALS = {
  email: 'admin@shiddit.com',
  password: 'AdminShiddit2025!',
  username: 'ShidditAdmin'
}

async function setupAdmin() {
  try {
    console.log('Setting up admin user...')
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      ADMIN_CREDENTIALS.email, 
      ADMIN_CREDENTIALS.password
    )
    
    const user = userCredential.user
    console.log('Admin user created in Auth:', user.uid)
    
    // Create user document in Firestore
    const userData = {
      id: user.uid,
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
    
    await setDoc(doc(db, 'users', user.uid), userData)
    console.log('Admin user document created in Firestore')
    
    console.log('✅ Admin setup complete!')
    console.log('Email:', ADMIN_CREDENTIALS.email)
    console.log('Password:', ADMIN_CREDENTIALS.password)
    console.log('Username:', ADMIN_CREDENTIALS.username)
    console.log('User ID:', user.uid)
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists. Signing in...')
      
      // Sign in to get the user
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        ADMIN_CREDENTIALS.email, 
        ADMIN_CREDENTIALS.password
      )
      
      const user = userCredential.user
      console.log('Admin user signed in:', user.uid)
      
      // Update user document to ensure admin status
      const userData = {
        id: user.uid,
        email: ADMIN_CREDENTIALS.email,
        username: ADMIN_CREDENTIALS.username,
        isAdmin: true,
        isBanned: false,
        lastActive: serverTimestamp()
      }
      
      await setDoc(doc(db, 'users', user.uid), userData, { merge: true })
      console.log('Admin user document updated in Firestore')
      
      console.log('✅ Admin user verified and updated!')
      
    } else {
      console.error('Error setting up admin:', error)
    }
  }
}

// Run the setup
setupAdmin()
