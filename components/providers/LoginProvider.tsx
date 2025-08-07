'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface LoginContextType {
  showLoginPopup: () => void
  hideLoginPopup: () => void
  isLoginOpen: boolean
}

const LoginContext = createContext<LoginContextType | undefined>(undefined)

export function LoginProvider({ children }: { children: ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const showLoginPopup = () => setIsLoginOpen(true)
  const hideLoginPopup = () => setIsLoginOpen(false)

  return (
    <LoginContext.Provider value={{ showLoginPopup, hideLoginPopup, isLoginOpen }}>
      {children}
    </LoginContext.Provider>
  )
}

export function useLogin() {
  const context = useContext(LoginContext)
  if (context === undefined) {
    throw new Error('useLogin must be used within a LoginProvider')
  }
  return context
}
