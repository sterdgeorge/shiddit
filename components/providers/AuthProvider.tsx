'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, User } from '@/lib/localData'

interface AuthContextType {
  user: User | null
  userProfile: User | null
  loading: boolean
  isBanned: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isBanned: false,
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
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBanned, setIsBanned] = useState(false)

  useEffect(() => {
    // Check for existing user in localStorage
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setUserProfile(currentUser)
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isBanned }}>
      {children}
    </AuthContext.Provider>
  )
} 