export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  authorUsername: string
  communityId: string
  communityName: string
  score: number
  upvotes: string[]
  downvotes: string[]
  comments: number
  createdAt: Date
  imageUrl?: string
  videoUrl?: string
  pollOptions?: string[]
}

export interface Community {
  id: string
  name: string
  description: string
  createdBy: string
  creatorUsername: string
  createdAt: Date
  memberCount: number
  imageUrl?: string
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

  // Premium and verification properties
  isPremium?: boolean
  isVerified?: boolean
  premiumSince?: Date
  verificationStatus?: string
  verificationStep?: 'initial' | 'payment' | 'confirmation'
  
  // Payment verification properties
  waitingForPayment?: boolean
  senderAddress?: string
  paymentRequestedAt?: Date
  paymentConfirmedAt?: Date
  
  // Admin properties
  adminLevel?: string
  canDeletePosts?: boolean
  canBanUsers?: boolean
  canManageCommunities?: boolean
  adminGrantedAt?: Date
  adminGrantedBy?: string
  
  // Social links
  twitterLink?: string
  websiteLink?: string
  
  // Privacy settings
  allowMessages?: boolean
} 