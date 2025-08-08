export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  authorUsername: string
  communityId: string
  communityName: string
  likes: number
  comments: number
  createdAt: Date
  imageUrl?: string
}

export interface Community {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: Date
  memberCount: number
}



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