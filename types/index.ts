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

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderUsername: string
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage?: Message
  lastMessageTime?: Date
}

export interface UserProfile {
  uid: string
  email: string
  username: string
  displayName?: string
  bio?: string
  avatar?: string
  createdAt: any
  friends: string[]
  isAdmin?: boolean
  isBanned?: boolean
  emailVerified?: boolean
  postKarma?: number
  commentKarma?: number
  totalKarma?: number
} 