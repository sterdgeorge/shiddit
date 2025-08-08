import { User } from 'lucide-react'

interface DefaultProfilePictureProps {
  username: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function DefaultProfilePicture({ 
  username, 
  size = 'md',
  className = '' 
}: DefaultProfilePictureProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-32 h-32 text-4xl'
  }

  const initial = username.charAt(0).toUpperCase()
  
  return (
    <div className={`bg-orange-500 rounded-full flex items-center justify-center text-white font-bold ${sizeClasses[size]} ${className}`}>
      {initial}
    </div>
  )
}
