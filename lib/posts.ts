import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion, arrayRemove, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from './firebase'

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  authorUsername: string
  communityId: string
  communityName: string
  createdAt: any
  updatedAt?: any
  upvotes: string[]
  downvotes: string[]
  score: number
  commentCount: number
  type: 'text' | 'image' | 'video' | 'link' | 'poll'
  url?: string
  imageUrl?: string
  videoUrl?: string
  tags: string[]
  isPinned?: boolean
  isLocked?: boolean
  isDeleted?: boolean
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorUsername: string
  content: string
  createdAt: any
  updatedAt?: any
  upvotes: string[]
  downvotes: string[]
  score: number
  parentId?: string
  replies: string[]
  isDeleted?: boolean
}

// Voting functions
export const votePost = async (postId: string, userId: string, voteType: 'upvote' | 'downvote' | 'remove') => {
  const postRef = doc(db, 'posts', postId)
  const postDoc = await getDoc(postRef)
  
  if (!postDoc.exists()) {
    throw new Error('Post not found')
  }
  
  const postData = postDoc.data() as Post
  const currentUpvotes = postData.upvotes || []
  const currentDownvotes = postData.downvotes || []
  const currentScore = postData.score || 0
  
  let newUpvotes = [...currentUpvotes]
  let newDownvotes = [...currentDownvotes]
  let scoreChange = 0
  
  // Remove existing votes
  if (currentUpvotes.includes(userId)) {
    newUpvotes = newUpvotes.filter(id => id !== userId)
    scoreChange -= 1
  }
  if (currentDownvotes.includes(userId)) {
    newDownvotes = newDownvotes.filter(id => id !== userId)
    scoreChange += 1
  }
  
  // Add new vote
  if (voteType === 'upvote') {
    newUpvotes.push(userId)
    scoreChange += 1
  } else if (voteType === 'downvote') {
    newDownvotes.push(userId)
    scoreChange -= 1
  }
  
  // Update post
  await updateDoc(postRef, {
    upvotes: newUpvotes,
    downvotes: newDownvotes,
    score: currentScore + scoreChange
  })
  
  // Update user karma
  if (voteType !== 'remove') {
    const userRef = doc(db, 'users', postData.authorId)
    await updateDoc(userRef, {
      postKarma: increment(scoreChange)
    })
  }
  
  return { score: currentScore + scoreChange, upvotes: newUpvotes, downvotes: newDownvotes }
}

export const voteComment = async (commentId: string, userId: string, voteType: 'upvote' | 'downvote' | 'remove') => {
  const commentRef = doc(db, 'comments', commentId)
  const commentDoc = await getDoc(commentRef)
  
  if (!commentDoc.exists()) {
    throw new Error('Comment not found')
  }
  
  const commentData = commentDoc.data() as Comment
  const currentUpvotes = commentData.upvotes || []
  const currentDownvotes = commentData.downvotes || []
  const currentScore = commentData.score || 0
  
  let newUpvotes = [...currentUpvotes]
  let newDownvotes = [...currentDownvotes]
  let scoreChange = 0
  
  // Remove existing votes
  if (currentUpvotes.includes(userId)) {
    newUpvotes = newUpvotes.filter(id => id !== userId)
    scoreChange -= 1
  }
  if (currentDownvotes.includes(userId)) {
    newDownvotes = newDownvotes.filter(id => id !== userId)
    scoreChange += 1
  }
  
  // Add new vote
  if (voteType === 'upvote') {
    newUpvotes.push(userId)
    scoreChange += 1
  } else if (voteType === 'downvote') {
    newDownvotes.push(userId)
    scoreChange -= 1
  }
  
  // Update comment
  await updateDoc(commentRef, {
    upvotes: newUpvotes,
    downvotes: newDownvotes,
    score: currentScore + scoreChange
  })
  
  // Update user karma
  if (voteType !== 'remove') {
    const userRef = doc(db, 'users', commentData.authorId)
    await updateDoc(userRef, {
      commentKarma: increment(scoreChange)
    })
  }
  
  return { score: currentScore + scoreChange, upvotes: newUpvotes, downvotes: newDownvotes }
}

// Feed algorithms
export const getFeedPosts = async (userId?: string, sortBy: 'hot' | 'new' | 'top' | 'controversial' | 'rising' = 'hot', limit: number = 20) => {
  let postsQuery
  
  if (sortBy === 'new') {
    postsQuery = query(
      collection(db, 'posts'),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limit)
    )
  } else if (sortBy === 'top') {
    postsQuery = query(
      collection(db, 'posts'),
      where('isDeleted', '==', false),
      orderBy('score', 'desc'),
      limit(limit)
    )
  } else {
    // Default to hot (score + recency)
    postsQuery = query(
      collection(db, 'posts'),
      where('isDeleted', '==', false),
      orderBy('score', 'desc'),
      limit(limit)
    )
  }
  
  const querySnapshot = await getDocs(postsQuery)
  const posts: Post[] = []
  
  querySnapshot.forEach((doc) => {
    posts.push({ id: doc.id, ...doc.data() } as Post)
  })
  
  return posts
}

export const getCommunityPosts = async (communityId: string, sortBy: 'hot' | 'new' | 'top' = 'hot', limit: number = 20) => {
  let postsQuery
  
  if (sortBy === 'new') {
    postsQuery = query(
      collection(db, 'posts'),
      where('communityId', '==', communityId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limit)
    )
  } else if (sortBy === 'top') {
    postsQuery = query(
      collection(db, 'posts'),
      where('communityId', '==', communityId),
      where('isDeleted', '==', false),
      orderBy('score', 'desc'),
      limit(limit)
    )
  } else {
    // Default to hot
    postsQuery = query(
      collection(db, 'posts'),
      where('communityId', '==', communityId),
      where('isDeleted', '==', false),
      orderBy('score', 'desc'),
      limit(limit)
    )
  }
  
  const querySnapshot = await getDocs(postsQuery)
  const posts: Post[] = []
  
  querySnapshot.forEach((doc) => {
    posts.push({ id: doc.id, ...doc.data() } as Post)
  })
  
  return posts
}

// Leaderboard functions
export const getTopPosts = async (timeframe: 'day' | 'week' | 'month' | 'year' | 'all' = 'week', limit: number = 10) => {
  const now = new Date()
  let startDate: Date
  
  switch (timeframe) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(0)
  }
  
  const postsQuery = query(
    collection(db, 'posts'),
    where('isDeleted', '==', false),
    where('createdAt', '>=', startDate),
    orderBy('score', 'desc'),
    limit(limit)
  )
  
  const querySnapshot = await getDocs(postsQuery)
  const posts: Post[] = []
  
  querySnapshot.forEach((doc) => {
    posts.push({ id: doc.id, ...doc.data() } as Post)
  })
  
  return posts
} 