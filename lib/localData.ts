// Local data management system (temporary replacement for Firebase)

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  authorUsername: string
  communityId: string
  communityName: string
  createdAt: Date
  upvotes: string[]
  downvotes: string[]
  score: number
  commentCount: number
  type: 'text' | 'image' | 'video' | 'link' | 'poll'
  url?: string
  imageUrl?: string
  videoUrl?: string
  isPinned?: boolean
}

export interface User {
  id: string
  email: string
  username: string
  isAdmin: boolean
  postKarma: number
  commentKarma: number
  totalKarma: number
}

// Sample data
const samplePosts: Post[] = []

const sampleUsers: User[] = [
  {
    id: "admin",
    email: "admin@shiddit.com",
    username: "admin",
    isAdmin: true,
    postKarma: 50,
    commentKarma: 25,
    totalKarma: 75
  }
]

// Local storage keys
const POSTS_KEY = 'shiddit_posts'
const USERS_KEY = 'shiddit_users'
const CURRENT_USER_KEY = 'shiddit_current_user'

// Initialize data
const initializeData = () => {
  if (typeof window === 'undefined') return

  // Initialize posts
  if (!localStorage.getItem(POSTS_KEY)) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(samplePosts))
  }

  // Initialize users
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(sampleUsers))
  }
}

// Get posts
export const getPosts = (): Post[] => {
  if (typeof window === 'undefined') return samplePosts
  initializeData()
  const posts = localStorage.getItem(POSTS_KEY)
  return posts ? JSON.parse(posts) : samplePosts
}

// Get users
export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return sampleUsers
  initializeData()
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : sampleUsers
}

// Save posts
export const savePosts = (posts: Post[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

// Save users
export const saveUsers = (users: User[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Vote on post
export const votePost = (postId: string, userId: string, voteType: 'upvote' | 'downvote' | 'remove') => {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post) return

  const postIndex = posts.findIndex(p => p.id === postId)
  const updatedPost = { ...post }

  // Remove existing votes
  updatedPost.upvotes = updatedPost.upvotes.filter(id => id !== userId)
  updatedPost.downvotes = updatedPost.downvotes.filter(id => id !== userId)

  // Add new vote
  if (voteType === 'upvote') {
    updatedPost.upvotes.push(userId)
  } else if (voteType === 'downvote') {
    updatedPost.downvotes.push(userId)
  }

  // Recalculate score
  updatedPost.score = updatedPost.upvotes.length - updatedPost.downvotes.length

  // Update posts
  posts[postIndex] = updatedPost
  savePosts(posts)

  return updatedPost
}

// Get current user
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem(CURRENT_USER_KEY)
  return user ? JSON.parse(user) : null
}

// Set current user
export const setCurrentUser = (user: User | null) => {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

// Login user
export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers()
  const user = users.find(u => u.email === email)
  
  if (user && password === 'admin123') { // Simple password check for demo
    setCurrentUser(user)
    return user
  }
  
  return null
}

// Logout user
export const logoutUser = () => {
  setCurrentUser(null)
}

// Create new post
export const createPost = (post: Omit<Post, 'id' | 'createdAt' | 'score' | 'upvotes' | 'downvotes'>) => {
  const posts = getPosts()
  const newPost: Post = {
    ...post,
    id: Date.now().toString(),
    createdAt: new Date(),
    score: 0,
    upvotes: [],
    downvotes: []
  }
  
  posts.unshift(newPost) // Add to beginning
  savePosts(posts)
  return newPost
}

// Get posts sorted by different criteria
export const getSortedPosts = (sortBy: 'hot' | 'new' | 'rising') => {
  const posts = getPosts()
  
  switch (sortBy) {
    case 'new':
      return [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    case 'rising':
      // Simple rising algorithm: recent posts with good scores
      return [...posts].sort((a, b) => {
        const aAge = Date.now() - a.createdAt.getTime()
        const bAge = Date.now() - b.createdAt.getTime()
        const aRising = a.score / Math.max(aAge / (1000 * 60 * 60), 1) // Score per hour
        const bRising = b.score / Math.max(bAge / (1000 * 60 * 60), 1)
        return bRising - aRising
      })
    default: // hot
      return [...posts].sort((a, b) => b.score - a.score)
  }
}

// Get top posts for leaderboard
export const getTopPosts = (limit: number = 10) => {
  const posts = getPosts()
  return [...posts].sort((a, b) => b.score - a.score).slice(0, limit)
}

// Clear all posts (for development/testing)
export const clearAllPosts = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(POSTS_KEY)
  console.log('All posts cleared from localStorage')
} 