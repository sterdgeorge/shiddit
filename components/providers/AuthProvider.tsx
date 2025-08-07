'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { UserProfile, getUserProfile } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  isBanned: boolean
  isEmailVerified: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isBanned: false,
  isEmailVerified: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBanned, setIsBanned] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Listen to user profile changes in real-time
        const unsubscribeProfile = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (doc) => {
            if (doc.exists()) {
              const profile = doc.data() as UserProfile
              setUserProfile(profile)
              setIsBanned(profile.isBanned || false)
              setIsEmailVerified(firebaseUser.emailVerified)
            } else {
              setUserProfile(null)
              setIsBanned(false)
              setIsEmailVerified(false)
            }
          },
          (error) => {
            console.error('Error fetching user profile:', error)
            setUserProfile(null)
            setIsBanned(false)
          }
        )

        return () => unsubscribeProfile()
      } else {
        setUserProfile(null)
        setIsBanned(false)
        setIsEmailVerified(false)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isBanned, isEmailVerified }}>
      {children}
    </AuthContext.Provider>
  )
} 