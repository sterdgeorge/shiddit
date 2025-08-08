'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { doc, updateDoc, deleteDoc, collection, query, getDocs, getDoc, setDoc, where, orderBy, limit } from 'firebase/firestore'
import { adminModifyCommunityMembers } from '@/lib/admin'
import { db } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'
import { Shield, Crown, CheckCircle, AlertCircle, User, Settings, Trash2, Ban, Users, MessageSquare, Eye, Search, Filter, RefreshCw } from 'lucide-react'

interface Post {
  id: string
  title: string
  authorUsername: string
  communityName: string
  score: number
  createdAt: any
  content: string
  upvotes?: string[]
}

interface Community {
  id: string
  name: string
  description: string
  memberCount: number
  createdAt: any
  creatorUsername: string
}

interface UserProfile {
  id: string
  username: string
  email: string
  isAdmin: boolean
  isPremium: boolean
  isVerified: boolean
  adminLevel?: string
  createdAt: any
  waitingForPayment: boolean
  senderAddress?: string
}

export default function AdminPage() {
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  
  // Data states
  const [posts, setPosts] = useState<Post[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<UserProfile[]>([])
  
  // UI states
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'communities' | 'users' | 'verifications' | 'fake-stats'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'premium' | 'verified'>('all')
  
  // Fake stats states
  const [fakeStats, setFakeStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalLikes: 0,
    totalMembers: 0
  })
  const [editingStats, setEditingStats] = useState(false)

  // Check if user is super admin
  const isSuperAdmin = userProfile?.isAdmin

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const fetchData = async () => {
    if (!isSuperAdmin) return
    
    setLoading(true)
    try {
      // Fetch posts
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50))
      const postsSnapshot = await getDocs(postsQuery)
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[]
      setPosts(postsData)

      // Fetch communities
      const communitiesQuery = query(collection(db, 'communities'), orderBy('createdAt', 'desc'), limit(50))
      const communitiesSnapshot = await getDocs(communitiesQuery)
      const communitiesData = communitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Community[]
      setCommunities(communitiesData)

      // Fetch users
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100))
      const usersSnapshot = await getDocs(usersQuery)
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[]
      setUsers(usersData)

      // Fetch pending verifications
      const pendingQuery = query(collection(db, 'users'), where('waitingForPayment', '==', true))
      const pendingSnapshot = await getDocs(pendingQuery)
      const pendingData = pendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[]
      setPendingVerifications(pendingData)

      // Fetch fake stats
      try {
        const statsDoc = await getDoc(doc(db, 'admin', 'fakeStats'))
        if (statsDoc.exists()) {
          const data = statsDoc.data()
          setFakeStats({
            totalUsers: data.totalUsers || 0,
            onlineUsers: data.onlineUsers || 0,
            totalLikes: data.totalLikes || 0,
            totalMembers: data.totalMembers || 0
          })
        }
      } catch (error) {
        console.log('No fake stats found, using defaults')
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      showMessage('Failed to fetch data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData()
    }
  }, [isSuperAdmin])

  // Admin Actions
  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return
    
    try {
      await deleteDoc(doc(db, 'posts', postId))
      setPosts(prev => prev.filter(post => post.id !== postId))
      showMessage('Post deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting post:', error)
      showMessage('Failed to delete post', 'error')
    }
  }

  const deleteCommunity = async (communityId: string) => {
    if (!confirm('Are you sure you want to delete this community? This will also delete all posts in the community.')) return
    
    try {
      await deleteDoc(doc(db, 'communities', communityId))
      setCommunities(prev => prev.filter(community => community.id !== communityId))
      showMessage('Community deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting community:', error)
      showMessage('Failed to delete community', 'error')
    }
  }

  const banUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to ban user "${username}"? This will delete their account and all their posts.`)) return
    
    try {
      // Delete user's posts
      const userPostsQuery = query(collection(db, 'posts'), where('authorId', '==', userId))
      const userPostsSnapshot = await getDocs(userPostsQuery)
      const deletePromises = userPostsSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Delete user document
      await deleteDoc(doc(db, 'users', userId))
      
      setUsers(prev => prev.filter(user => user.id !== userId))
      showMessage(`User "${username}" has been banned`, 'success')
    } catch (error) {
      console.error('Error banning user:', error)
      showMessage('Failed to ban user', 'error')
    }
  }

  const verifyUser = async (userId: string, username: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isPremium: true,
        isVerified: true,
        premiumSince: new Date(),
        waitingForPayment: false,
        paymentConfirmedAt: new Date(),
        verificationStep: 'confirmation',
        verificationStatus: 'verified'
      })
      
      setPendingVerifications(prev => prev.filter(user => user.id !== userId))
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isPremium: true, isVerified: true, waitingForPayment: false }
          : user
      ))
      showMessage(`User "${username}" has been verified`, 'success')
    } catch (error) {
      console.error('Error verifying user:', error)
      showMessage('Failed to verify user', 'error')
    }
  }

  const updateFakeStats = async (newStats: typeof fakeStats) => {
    try {
      await setDoc(doc(db, 'admin', 'fakeStats'), newStats)
      setFakeStats(newStats)
      setEditingStats(false)
      showMessage('Fake statistics updated successfully', 'success')
    } catch (error) {
      console.error('Error updating fake stats:', error)
      showMessage('Failed to update fake statistics', 'error')
    }
  }

  const saveFakeStats = () => {
    updateFakeStats(fakeStats)
  }

  const modifyCommunityMembers = async (communityId: string, newMemberCount: number) => {
    if (!user) return
    
    try {
      await adminModifyCommunityMembers(communityId, user.uid, newMemberCount)
      
      // Update local state
      setCommunities(prev => prev.map(community => 
        community.id === communityId 
          ? { ...community, memberCount: newMemberCount }
          : community
      ))
      
      showMessage(`Community member count updated to ${newMemberCount}`, 'success')
    } catch (error) {
      console.error('Error modifying community member count:', error)
      showMessage('Failed to modify community member count', 'error')
    }
  }

  const setupGodUser = async () => {
    if (!user) return
    
    setLoading(true)
    setMessage('')
    
    try {
      // Find the user with username "god"
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('username', '==', 'god'))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        showMessage('User "god" not found. Please create the user first.', 'error')
        return
      }

      const godUser = querySnapshot.docs[0]
      const userId = godUser.id

      // Update the user to have admin powers and verification
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: true,
        isPremium: true,
        isVerified: true,
        adminLevel: 'super',
        canDeletePosts: true,
        canBanUsers: true,
        canManageCommunities: true,
        adminGrantedAt: new Date(),
        adminGrantedBy: user.uid,
        premiumSince: new Date(),
        verificationStatus: 'verified'
      })

      showMessage('✅ User "god" has been granted admin powers and verification!', 'success')
    } catch (error) {
      console.error('Error setting up god admin:', error)
      showMessage('Failed to set up god admin. Please check console for details.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Filter functions
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.authorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.communityName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === 'all') return matchesSearch
    if (filterType === 'admin') return matchesSearch && user.isAdmin
    if (filterType === 'premium') return matchesSearch && user.isPremium
    if (filterType === 'verified') return matchesSearch && user.isVerified
    
    return matchesSearch
  })

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access admin features
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

  if (!isSuperAdmin) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need super admin privileges to access this page.
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Crown className="w-8 h-8 text-orange-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Super Admin Panel
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                God-like control over the entire platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'posts', label: 'Posts', icon: MessageSquare },
            { id: 'communities', label: 'Communities', icon: Users },
            { id: 'users', label: 'Users', icon: User },
            { id: 'verifications', label: 'Verifications', icon: CheckCircle },
            { id: 'fake-stats', label: 'Fake Stats', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {activeTab === 'users' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Users</option>
              <option value="admin">Admins</option>
              <option value="premium">Premium</option>
              <option value="verified">Verified</option>
            </select>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Communities</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{communities.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                  </div>
                  <User className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending Verifications</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingVerifications.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Posts</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{post.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by u/{post.authorUsername} in s/{post.communityName} • {post.score} points
                      </p>
                    </div>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Communities Tab */}
          {activeTab === 'communities' && (
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Communities</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCommunities.map((community) => (
                  <div key={community.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">s/{community.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {community.memberCount} members
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={community.memberCount}
                            onChange={(e) => {
                              const newCount = parseInt(e.target.value) || 0
                              setCommunities(prev => prev.map(c => 
                                c.id === community.id ? { ...c, memberCount: newCount } : c
                              ))
                            }}
                            onBlur={(e) => {
                              const newCount = parseInt(e.target.value) || 0
                              if (newCount !== community.memberCount) {
                                modifyCommunityMembers(community.id, newCount)
                              }
                            }}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          • Created by u/{community.creatorUsername}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{community.description}</p>
                    </div>
                    <button
                      onClick={() => deleteCommunity(community.id)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete community"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Users</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">u/{user.username}</h4>
                                                 {user.isAdmin && <Shield className="w-4 h-4 text-red-500" />}
                         {user.isVerified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                         {user.isPremium && <Crown className="w-4 h-4 text-orange-500" />}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => banUser(user.id, user.username)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Ban user"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verifications Tab */}
          {activeTab === 'verifications' && (
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Verifications</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingVerifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No pending verifications
                  </div>
                ) : (
                  pendingVerifications.map((user) => (
                    <div key={user.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">u/{user.username}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        {user.senderAddress && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            From: {user.senderAddress}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => verifyUser(user.id, user.username)}
                        className="ml-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Verify User
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Fake Stats Tab */}
          {activeTab === 'fake-stats' && (
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Fake Statistics</h3>
                  <div className="flex items-center space-x-2">
                    {editingStats ? (
                      <>
                        <button
                          onClick={saveFakeStats}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingStats(false)}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingStats(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Edit Stats
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Fake stats are <strong>additive</strong> to real stats. 
                    Setting "Total Users" to 100 will show: Real users (6) + Fake users (100) = 106 total users.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fake Total Users (adds to real: {users.length})
                      </label>
                      {editingStats ? (
                        <input
                          type="number"
                          value={fakeStats.totalUsers}
                          onChange={(e) => setFakeStats(prev => ({ ...prev, totalUsers: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="0"
                        />
                      ) : (
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {fakeStats.totalUsers.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total displayed: {(users.length + fakeStats.totalUsers).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fake Online Users (adds to real: 1)
                      </label>
                      {editingStats ? (
                        <input
                          type="number"
                          value={fakeStats.onlineUsers}
                          onChange={(e) => setFakeStats(prev => ({ ...prev, onlineUsers: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="0"
                        />
                      ) : (
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {fakeStats.onlineUsers.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total displayed: {(1 + fakeStats.onlineUsers).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fake Total Likes (adds to real: {posts.reduce((sum, post) => sum + (post.upvotes?.length || 0), 0)})
                      </label>
                      {editingStats ? (
                        <input
                          type="number"
                          value={fakeStats.totalLikes}
                          onChange={(e) => setFakeStats(prev => ({ ...prev, totalLikes: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="0"
                        />
                      ) : (
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {fakeStats.totalLikes.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total displayed: {(posts.reduce((sum, post) => sum + (post.upvotes?.length || 0), 0) + fakeStats.totalLikes).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fake Total Community Members (adds to real: {communities.reduce((sum, community) => sum + (community.memberCount || 0), 0)})
                      </label>
                      {editingStats ? (
                        <input
                          type="number"
                          value={fakeStats.totalMembers}
                          onChange={(e) => setFakeStats(prev => ({ ...prev, totalMembers: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="0"
                        />
                      ) : (
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {fakeStats.totalMembers.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total displayed: {(communities.reduce((sum, community) => sum + (community.memberCount || 0), 0) + fakeStats.totalMembers).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      These fake statistics will be displayed to users to make the platform appear more active and popular.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Setup God User Section */}
        <div className="mt-8 card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-8 h-8 text-orange-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Setup God User
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Grant admin powers to the "god" user
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  This will grant the "god" user super admin privileges
                </span>
              </div>
            </div>

            <button
              onClick={setupGodUser}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  <span>Setup God User</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            messageType === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                messageType === 'success' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {message}
              </span>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 