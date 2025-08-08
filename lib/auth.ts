import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc, collection, query, getDocs } from 'firebase/firestore'
import { auth, db } from './firebase'
import { ADMIN_CREDENTIALS } from './constants'

export interface UserProfile {
  uid: string
  email: string
  username: string
  displayName?: string
  bio?: string
  avatar?: string
  profilePicture?: string
  createdAt: any
  friends: string[]
  isAdmin?: boolean
  isBanned?: boolean
  emailVerified?: boolean
  postKarma?: number
  commentKarma?: number
  totalKarma?: number

  isPremium?: boolean
}

export const registerUser = async (
  email: string,
  password: string,
  username: string
): Promise<User> => {
  try {
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      throw new Error('Username must be 3-20 characters long and contain only letters, numbers, and underscores')
    }

    // Check if username is already taken
    const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()))
    if (usernameDoc.exists()) {
      throw new Error('Username already taken')
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with username
    await updateProfile(user, {
      displayName: username,
    })

    // Send email verification
    await sendEmailVerification(user)

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      username: username.toLowerCase(),
      displayName: username,
      bio: '',
      avatar: '',
      createdAt: serverTimestamp(),
      friends: [],
      isAdmin: email === ADMIN_CREDENTIALS.EMAIL,
      postKarma: 0,
      commentKarma: 0,
      totalKarma: 0,
      emailVerified: false,
    }

    await setDoc(doc(db, 'users', user.uid), userProfile)
    await setDoc(doc(db, 'usernames', username.toLowerCase()), { uid: user.uid })

    return user
  } catch (error) {
    throw error
  }
}

export const loginUser = async (emailOrUsername: string, password: string) => {
  try {
    console.log('Login attempt:', { emailOrUsername, isAdminEmail: emailOrUsername === ADMIN_CREDENTIALS.EMAIL })
    
    // Check for admin login (local testing only)
    if (emailOrUsername === ADMIN_CREDENTIALS.EMAIL && password === ADMIN_CREDENTIALS.PASSWORD) {
      console.log('Admin login detected, attempting to sign in...')
      
      // Try to sign in first
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailOrUsername, password)
        console.log('Admin user signed in successfully')
        
        // Ensure admin status is set
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          isAdmin: true
        }, { merge: true })
        
        return userCredential.user
      } catch (error: any) {
        console.log('Admin sign in error:', error.code)
        
        // If admin user doesn't exist, create it
        if (error.code === 'auth/user-not-found') {
          console.log('Admin user not found, creating new admin user...')
          const adminUser = await registerUser(emailOrUsername, password, ADMIN_CREDENTIALS.USERNAME)
          // Mark as admin
          await setDoc(doc(db, 'users', adminUser.uid), {
            isAdmin: true
          }, { merge: true })
          console.log('Admin user created successfully')
          return adminUser
        }
        
        // If wrong password, try to create admin user with correct password
        if (error.code === 'auth/wrong-password') {
          console.log('Wrong password for admin user, creating new admin user...')
          // Delete the existing user and create a new one
          try {
            const adminUser = await registerUser(emailOrUsername, password, ADMIN_CREDENTIALS.USERNAME)
            await setDoc(doc(db, 'users', adminUser.uid), {
              isAdmin: true
            }, { merge: true })
            console.log('New admin user created successfully')
            return adminUser
          } catch (registerError: any) {
            if (registerError.code === 'auth/email-already-in-use') {
              throw new Error('Admin user exists but password is incorrect. Please reset the password in Firebase Console.')
            }
            throw registerError
          }
        }
        
        throw error
      }
    }
    
    console.log('Regular user login attempt...')
    
    // Check if input is email or username
    const isEmail = emailOrUsername.includes('@')
    let actualEmail = emailOrUsername
    
    if (!isEmail) {
      // It's a username, find the corresponding email
      const usernameDoc = await getDoc(doc(db, 'usernames', emailOrUsername.toLowerCase()))
      if (!usernameDoc.exists()) {
        throw new Error('No account found with this username')
      }
      const userDoc = await getDoc(doc(db, 'users', usernameDoc.data().uid))
      if (!userDoc.exists()) {
        throw new Error('User account not found')
      }
      actualEmail = userDoc.data().email
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, actualEmail, password)
    return userCredential.user
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw error
  }
}

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw error
  }
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    throw error
  }
}

// Admin utility functions
export const isAdmin = (userProfile: UserProfile | null): boolean => {
  return userProfile?.isAdmin === true
}

export const deletePost = async (postId: string, userId: string, userProfile: UserProfile | null) => {
  if (!isAdmin(userProfile)) {
    throw new Error('Unauthorized: Admin access required')
  }
  
  await deleteDoc(doc(db, 'posts', postId))
}

export const deleteCommunity = async (communityId: string, userId: string, userProfile: UserProfile | null) => {
  if (!isAdmin(userProfile)) {
    throw new Error('Unauthorized: Admin access required')
  }
  
  await deleteDoc(doc(db, 'communities', communityId))
}

export const getAllUsers = async (userProfile: UserProfile | null) => {
  if (!isAdmin(userProfile)) {
    throw new Error('Unauthorized: Admin access required')
  }
  
  const usersQuery = query(collection(db, 'users'))
  const querySnapshot = await getDocs(usersQuery)
  const users: UserProfile[] = []
  
  querySnapshot.forEach((doc) => {
    users.push(doc.data() as UserProfile)
  })
  
  return users
} 