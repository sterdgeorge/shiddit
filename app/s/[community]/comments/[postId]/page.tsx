'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp, updateDoc, increment, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/providers/AuthProvider'
import MainLayout from '@/components/layout/MainLayout'
import VoteButtons from '@/components/ui/VoteButtons'
import { ArrowLeft, MessageCircle, Clock, User } from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  authorUsername: string
  communityName: string
  createdAt: any
  score: number
  upvotes: string[]
  downvotes: string[]
  commentCount: number
  imageUrl?: string
  videoUrl?: string
}

interface Comment {
  id: string
  content: string
  authorUsername: string
  createdAt: any
  score: number
  upvotes: string[]
  downvotes: string[]
  postId: string
  replyTo?: string
}

export default function PostPage() {
  const params = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const communityName = params.community as string
  const postId = params.postId as string

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [postId])

  const fetchPost = async () => {
    try {
      const postDoc = await getDoc(doc(db, 'posts', postId))
      
      if (!postDoc.exists()) {
        setError('Post not found')
        setLoading(false)
        return
      }

      const data = postDoc.data()
      const postData: Post = {
        id: postDoc.id,
        title: data.title,
        content: data.content,
        authorUsername: data.authorUsername,
        communityName: data.communityName,
        createdAt: data.createdAt,
        score: data.score || 0,
        upvotes: data.upvotes || [],
        downvotes: data.downvotes || [],
        commentCount: data.commentCount || 0,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl
      }

      setPost(postData)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const commentsQuery = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'desc')
      )
      const commentsSnapshot = await getDocs(commentsQuery)
      const commentsData: Comment[] = []

      commentsSnapshot.forEach((doc) => {
        const data = doc.data()
        commentsData.push({
          id: doc.id,
          content: data.content,
          authorUsername: data.authorUsername,
          createdAt: data.createdAt,
          score: data.score || 0,
          upvotes: data.upvotes || [],
          downvotes: data.downvotes || [],
          postId: data.postId,
          replyTo: data.replyTo
        })
      })

      // Sort comments by score (highest first)
      commentsData.sort((a, b) => b.score - a.score)
      setComments(commentsData)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleVote = async (itemId: string, voteType: 'upvote' | 'downvote', isComment: boolean = false) => {
    if (!user) return

    try {
      if (isComment) {
        // Handle comment voting
        const commentRef = doc(db, 'comments', itemId)
        const commentDoc = await getDoc(commentRef)
        
        if (!commentDoc.exists()) return

        const data = commentDoc.data()
        const currentUpvotes = data.upvotes || []
        const currentDownvotes = data.downvotes || []
        let newUpvotes = [...currentUpvotes]
        let newDownvotes = [...currentDownvotes]

        if (voteType === 'upvote') {
          if (currentUpvotes.includes(user.uid)) {
            // Remove upvote
            newUpvotes = currentUpvotes.filter((id: string) => id !== user.uid)
          } else {
            // Add upvote, remove downvote if exists
            newUpvotes.push(user.uid)
            newDownvotes = currentDownvotes.filter((id: string) => id !== user.uid)
          }
        } else {
          if (currentDownvotes.includes(user.uid)) {
            // Remove downvote
            newDownvotes = currentDownvotes.filter((id: string) => id !== user.uid)
          } else {
            // Add downvote, remove upvote if exists
            newDownvotes.push(user.uid)
            newUpvotes = currentUpvotes.filter((id: string) => id !== user.uid)
          }
        }

        const newScore = newUpvotes.length - newDownvotes.length

        await updateDoc(commentRef, {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          score: newScore
        })

        // Update local state
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === itemId 
              ? { ...comment, upvotes: newUpvotes, downvotes: newDownvotes, score: newScore }
              : comment
          )
        )
             } else {
         // Handle post voting using the same logic as PostCard
         const hasUpvoted = post?.upvotes?.includes(user.uid) || false
         const hasDownvoted = post?.downvotes?.includes(user.uid) || false
         
         let actualVoteType: 'upvote' | 'downvote' | 'remove'
         
         if (voteType === 'upvote') {
           if (hasUpvoted) {
             actualVoteType = 'remove'
           } else {
             actualVoteType = 'upvote'
           }
         } else {
           if (hasDownvoted) {
             actualVoteType = 'remove'
           } else {
             actualVoteType = 'downvote'
           }
         }

         // Import and use the votePost function
         const { votePost } = await import('@/lib/posts')
         const result = await votePost(itemId, user.uid, actualVoteType)
         
         // Update local state
         if (post) {
           setPost({
             ...post,
             upvotes: result.upvotes,
             downvotes: result.downvotes,
             score: result.score
           })
         }
       }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmittingComment(true)

    try {
      const commentData = {
        content: newComment.trim(),
        authorId: user.uid,
        authorUsername: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        postId: postId,
        replyTo: post?.title || 'this post',
        createdAt: serverTimestamp(),
        score: 0,
        upvotes: [],
        downvotes: []
      }

      await addDoc(collection(db, 'comments'), commentData)

      // Update post comment count
      if (post) {
        await updateDoc(doc(db, 'posts', postId), {
          commentCount: increment(1)
        })
        setPost({
          ...post,
          commentCount: post.commentCount + 1
        })
      }

      setNewComment('')
      fetchComments() // Refresh comments
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Post not found'}
            </h1>
            <Link 
              href={`/s/${communityName}`}
              className="inline-flex items-center text-orange-500 hover:text-orange-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {communityName}
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Back button */}
        <Link 
          href={`/s/${communityName}`}
          className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {communityName}
        </Link>

        {/* Post */}
        <div className="card p-6 mb-6">
          <div className="flex items-start space-x-4">
            {/* Vote buttons */}
            <div className="flex flex-col items-center">
                             <VoteButtons
                 score={post.score}
                 upvotes={post.upvotes}
                 downvotes={post.downvotes}
                 onVote={(voteType) => handleVote(post.id, voteType, false)}
                 userId={user?.uid}
               />
            </div>

            {/* Post content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {post.title}
              </h1>
              
              <div className="text-gray-600 dark:text-gray-400 mb-4">
                <span>Posted by </span>
                <Link 
                  href={`/user/${post.authorUsername}`}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  {post.authorUsername}
                </Link>
                <span> in </span>
                <Link 
                  href={`/s/${post.communityName}`}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  s/{post.communityName}
                </Link>
                <span className="ml-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {formatDate(post.createdAt)}
                </span>
              </div>

              {/* Post content */}
              <div className="prose dark:prose-invert max-w-none mb-4">
                {post.content && (
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-4">
                    {post.content}
                  </p>
                )}
                {post.imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={post.imageUrl} 
                      alt="Post image" 
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                {post.videoUrl && (
                  <div className="mb-4">
                    <video 
                      src={post.videoUrl} 
                      controls 
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Comment count */}
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-4 h-4 mr-1" />
                {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Comment form */}
        {user && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add a comment
            </h2>
            <form onSubmit={handleSubmitComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                rows={4}
                required
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h2>
          
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="card p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex flex-col items-center">
                                         <VoteButtons
                       score={comment.score}
                       upvotes={comment.upvotes}
                       downvotes={comment.downvotes}
                       onVote={(voteType) => handleVote(comment.id, voteType, true)}
                       userId={user?.uid}
                       isComment={true}
                     />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <User className="w-4 h-4 mr-1" />
                      <Link 
                        href={`/user/${comment.authorUsername}`}
                        className="text-orange-500 hover:text-orange-600 font-medium"
                      >
                        {comment.authorUsername}
                      </Link>
                      <span className="mx-2">•</span>
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(comment.createdAt)}
                      {comment.replyTo && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-gray-400">replied to {comment.replyTo}</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  )
}
