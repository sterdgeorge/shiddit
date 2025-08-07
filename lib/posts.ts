import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  where,
  Timestamp
} from 'firebase/firestore'
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

// Get posts sorted by different criteria
export const getSortedPosts = async (sortBy: 'hot' | 'new' | 'rising'): Promise<Post[]> => {
  try {
    let postsQuery
    
    switch (sortBy) {
      case 'new':
        postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        )
        break
      case 'rising':
        // For rising, we'll sort by score first, then by recency
        postsQuery = query(
          collection(db, 'posts'),
          orderBy('score', 'desc'),
          orderBy('createdAt', 'desc')
        )
        break
      default: // hot
        postsQuery = query(
          collection(db, 'posts'),
          orderBy('score', 'desc')
        )
        break
    }
    
    const querySnapshot = await getDocs(postsQuery)
    const posts: Post[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      posts.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorUsername: data.authorUsername,
        communityId: data.communityId,
        communityName: data.communityName,
        createdAt: data.createdAt,
        upvotes: data.upvotes || [],
        downvotes: data.downvotes || [],
        score: data.score || 0,
        commentCount: data.commentCount || 0,
        type: data.type || 'text',
        url: data.url,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        isPinned: data.isPinned || false
      })
    })
    
    return posts
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

// Get top posts for leaderboard
export const getTopPosts = async (limitCount: number = 10): Promise<Post[]> => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('score', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(postsQuery)
    const posts: Post[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      posts.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorUsername: data.authorUsername,
        communityId: data.communityId,
        communityName: data.communityName,
        createdAt: data.createdAt,
        upvotes: data.upvotes || [],
        downvotes: data.downvotes || [],
        score: data.score || 0,
        commentCount: data.commentCount || 0,
        type: data.type || 'text',
        url: data.url,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        isPinned: data.isPinned || false
      })
    })
    
    return posts
  } catch (error) {
    console.error('Error fetching top posts:', error)
    return []
  }
}

// Vote on post
export const votePost = async (postId: string, userId: string, voteType: 'upvote' | 'downvote' | 'remove') => {
  try {
    const postRef = doc(db, 'posts', postId)
    const postDoc = await getDocs(query(collection(db, 'posts'), where('__name__', '==', postId)))
    
    if (postDoc.empty) {
      throw new Error('Post not found')
    }
    
    const postData = postDoc.docs[0].data()
    const upvotes = postData.upvotes || []
    const downvotes = postData.downvotes || []
    
    // Remove existing votes
    const newUpvotes = upvotes.filter((id: string) => id !== userId)
    const newDownvotes = downvotes.filter((id: string) => id !== userId)
    
    // Add new vote
    if (voteType === 'upvote') {
      newUpvotes.push(userId)
    } else if (voteType === 'downvote') {
      newDownvotes.push(userId)
    }
    
    // Calculate new score
    const newScore = newUpvotes.length - newDownvotes.length
    
    // Update the post
    await updateDoc(postRef, {
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newScore
    })
    
    return {
      id: postId,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newScore
    }
  } catch (error) {
    console.error('Error voting on post:', error)
    throw error
  }
}

// Create new post
export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'score' | 'upvotes' | 'downvotes'>) => {
  try {
    const newPost = {
      ...post,
      createdAt: serverTimestamp(),
      score: 0,
      upvotes: [],
      downvotes: [],
      commentCount: 0
    }
    
    const docRef = await addDoc(collection(db, 'posts'), newPost)
    
    return {
      id: docRef.id,
      ...newPost
    }
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
} 