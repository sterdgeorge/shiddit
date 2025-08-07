'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import MainLayout from '@/components/layout/MainLayout'
import { 
  Shield, 
  Users, 
  Ban, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  AlertTriangle,
  CheckCircle,
  X,
  MessageSquare,
  FileText,
  UserCheck,
  UserX
} from 'lucide-react'
import { 
  getAllUsers, 
  getBannedUsers, 
  banUser, 
  unbanUser, 
  deletePost, 
  deleteComment,
  getUserDetails,
  isAdmin,
  AdminUser,
  BanData
} from '@/lib/admin'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'

interface Post {
  id: string
  title: string
  authorUsername: string
  authorId: string
  createdAt: any
  likes: number
  comments: number
}

interface Comment {
  id: string
  content: string
  authorUsername: string
  authorId: string
  postId: string
  createdAt: any
}

export default function AdminPage() {
  const { user } = useAuth()
  const { showLoginPopup } = useLogin()
  
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [bannedUsers, setBannedUsers] = useState<AdminUser[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [banReason, setBanReason] = useState('')
  const [showBanModal, setShowBanModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    checkAdminStatus()
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const adminStatus = await isAdmin(user.id)
      setIsUserAdmin(adminStatus)
      
      if (adminStatus) {
        loadData()
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      const [usersData, bannedData, postsData, commentsData] = await Promise.all([
        getAllUsers(),
        getBannedUsers(),
        getPosts(),
        getComments()
      ])
      
      setUsers(usersData)
      setBannedUsers(bannedData)
      setPosts(postsData)
      setComments(commentsData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  const getPosts = async (): Promise<Post[]> => {
    try {
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
      const snapshot = await getDocs(postsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[]
    } catch (error) {
      console.error('Error getting posts:', error)
      return []
    }
  }

  const getComments = async (): Promise<Comment[]> => {
    try {
      const commentsQuery = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), limit(50))
      const snapshot = await getDocs(commentsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[]
    } catch (error) {
      console.error('Error getting comments:', error)
      return []
    }
  }

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) return

    setActionLoading(true)
    try {
      const banData: BanData = {
        reason: banReason,
        bannedBy: user!.id,
        bannedAt: new Date()
      }

      const success = await banUser(selectedUser.id, banData)
      if (success) {
        setShowBanModal(false)
        setBanReason('')
        setSelectedUser(null)
        loadData() // Refresh data
        alert('User banned successfully')
      } else {
        alert('Failed to ban user')
      }
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Error banning user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnbanUser = async (userId: string) => {
    setActionLoading(true)
    try {
      const success = await unbanUser(userId, user!.id)
      if (success) {
        loadData() // Refresh data
        alert('User unbanned successfully')
      } else {
        alert('Failed to unban user')
      }
    } catch (error) {
      console.error('Error unbanning user:', error)
      alert('Error unbanning user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return

    setActionLoading(true)
    try {
      const success = await deletePost(postId, user!.id)
      if (success) {
        loadData() // Refresh data
        alert('Post deleted successfully')
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return

    setActionLoading(true)
    try {
      const success = await deleteComment(commentId, user!.id)
      if (success) {
        loadData() // Refresh data
        alert('Comment deleted successfully')
      } else {
        alert('Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Error deleting comment')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.authorUsername.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.authorUsername.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access the admin panel
          </p>
          <button
            onClick={showLoginPopup}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium transition-colors"
          >
            Log In
          </button>
        </div>
      </MainLayout>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </MainLayout>
    )
  }

  if (!isUserAdmin) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the admin panel
          </p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, content, and site moderation
          </p>
        </div>

        {/* Search Bar */}
        <div className="card p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users, posts, or comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'users', label: 'Users', icon: Users, count: users.length },
            { id: 'banned', label: 'Banned', icon: Ban, count: bannedUsers.length },
            { id: 'posts', label: 'Posts', icon: FileText, count: posts.length },
            { id: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card p-6">
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                All Users ({filteredUsers.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2">User</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Karma</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 font-medium text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.username}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {user.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {user.email}
                        </td>
                        <td className="py-3">
                          <div className="text-sm">
                            <p className="text-gray-900 dark:text-white">{user.totalKarma}</p>
                            <p className="text-gray-500 dark:text-gray-400">
                              {user.postKarma} post • {user.commentKarma} comment
                            </p>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            {user.isAdmin && (
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                Admin
                              </span>
                            )}
                            {user.isBanned ? (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full">
                                Banned
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowUserModal(true)
                              }}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!user.isBanned && !user.isAdmin && (
                              <button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowBanModal(true)
                                }}
                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                title="Ban User"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'banned' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Banned Users ({bannedUsers.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2">User</th>
                      <th className="text-left py-2">Ban Reason</th>
                      <th className="text-left py-2">Banned By</th>
                      <th className="text-left py-2">Banned At</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bannedUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                              <span className="text-red-600 dark:text-red-400 font-medium text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.username}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {user.banReason || 'No reason provided'}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {user.bannedBy || 'Unknown'}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {user.bannedAt ? new Date(user.bannedAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleUnbanUser(user.id)}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors disabled:opacity-50"
                          >
                            Unban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Posts ({filteredPosts.length})
              </h2>
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>by {post.authorUsername}</span>
                          <span>{post.likes} likes</span>
                          <span>{post.comments} comments</span>
                          <span>{post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={actionLoading}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Comments ({filteredComments.length})
              </h2>
              <div className="space-y-4">
                {filteredComments.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white mb-2">
                          {comment.content}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>by {comment.authorUsername}</span>
                          <span>Post ID: {comment.postId.slice(0, 8)}...</span>
                          <span>{comment.createdAt ? new Date(comment.createdAt.toDate()).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={actionLoading}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ban Modal */}
        {showBanModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Ban User: {selectedUser.username}
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ban Reason *
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter reason for banning this user..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowBanModal(false)
                      setBanReason('')
                      setSelectedUser(null)
                    }}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBanUser}
                    disabled={!banReason.trim() || actionLoading}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Banning...' : 'Ban User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    User Details: {selectedUser.username}
                  </h3>
                  <button
                    onClick={() => {
                      setShowUserModal(false)
                      setSelectedUser(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <p className="text-gray-900 dark:text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID:</span>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedUser.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Karma:</span>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.totalKarma} total ({selectedUser.postKarma} post, {selectedUser.commentKarma} comment)
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {selectedUser.isAdmin && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                      {selectedUser.isBanned ? (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedUser.isBanned && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ban Reason:</span>
                      <p className="text-gray-900 dark:text-white">{selectedUser.banReason || 'No reason provided'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 