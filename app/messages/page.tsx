'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { Send, User, Search, MoreHorizontal, Image as ImageIcon, Smile, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: Date
  senderUsername: string
  receiverUsername: string
  read: boolean
}

interface Conversation {
  id: string
  participants: string[]
  lastMessage: string
  lastMessageTime: Date
  otherUser: {
    uid: string
    username: string
    profilePicture?: string
  }
  unreadCount: number
}

interface UserProfile {
  uid: string
  username: string
  profilePicture?: string
  bio?: string
}

export default function MessagesPage() {
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null)

  // Rate limiting for messages
  const MAX_MESSAGES_PER_MINUTE = 10
  const MAX_MESSAGE_LENGTH = 1000

  useEffect(() => {
    if (!user) return

    // Fetch conversations with security rules
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.id),
      orderBy('lastMessageTime', 'desc'),
      limit(50) // Limit to prevent abuse
    )

    const unsubscribeConversations = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsData: Conversation[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        const otherUserId = data.participants.find((id: string) => id !== user.id)
        conversationsData.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          otherUser: {
            uid: otherUserId,
            username: data.participantUsernames?.[otherUserId] || 'Unknown',
            profilePicture: data.participantProfilePictures?.[otherUserId]
          },
          unreadCount: data.unreadCount?.[user.id] || 0
        })
      })
      setConversations(conversationsData)
      setLoading(false)
    })

    return () => unsubscribeConversations()
  }, [user])

  useEffect(() => {
    if (!selectedConversation || !user) return

    // Mark messages as read
    const markAsRead = async () => {
      try {
        const conversationRef = doc(db, 'conversations', selectedConversation)
        await updateDoc(conversationRef, {
          [`unreadCount.${user.id}`]: 0
        })
      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    }

    markAsRead()

    // Fetch messages with security rules
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', selectedConversation),
      orderBy('createdAt', 'asc'),
      limit(100) // Limit to prevent abuse
    )

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData: Message[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        messagesData.push({
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          createdAt: data.createdAt?.toDate() || new Date(),
          senderUsername: data.senderUsername,
          receiverUsername: data.receiverUsername,
          read: data.read || false
        })
      })
      setMessages(messagesData)
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })

    return () => unsubscribeMessages()
  }, [selectedConversation, user])

  // Rate limiting check
  const checkRateLimit = () => {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    
    if (lastMessageTime && lastMessageTime > oneMinuteAgo && messageCount >= MAX_MESSAGES_PER_MINUTE) {
      return false
    }
    
    if (lastMessageTime && lastMessageTime > oneMinuteAgo) {
      setMessageCount(prev => prev + 1)
    } else {
      setMessageCount(1)
      setLastMessageTime(now)
    }
    
    return true
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user || !userProfile) return
    
    // Security checks
    if (newMessage.length > MAX_MESSAGE_LENGTH) {
      alert(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`)
      return
    }

    if (!checkRateLimit()) {
      alert('You are sending messages too quickly. Please wait a moment.')
      return
    }

    // Validate conversation participants
    const conversation = conversations.find(c => c.id === selectedConversation)
    if (!conversation || !conversation.participants.includes(user.id)) {
      alert('Invalid conversation')
      return
    }

    try {
      const receiverId = conversation.otherUser.uid

      // Add message with security metadata
      await addDoc(collection(db, 'messages'), {
        conversationId: selectedConversation,
        senderId: user.id,
        receiverId,
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
        senderUsername: userProfile.username,
        receiverUsername: conversation.otherUser.username,
        read: false,
        // Security metadata
        senderIP: 'client-side', // Will be validated server-side
        timestamp: serverTimestamp()
      })

      // Update conversation
      const conversationRef = doc(db, 'conversations', selectedConversation)
      await updateDoc(conversationRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${receiverId}`]: (conversation.unreadCount || 0) + 1
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim() || !user) return

    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('username', '>=', searchQuery),
        where('username', '<=', searchQuery + '\uf8ff'),
        limit(10)
      )
      
      const snapshot = await getDocs(usersQuery)
      const results: UserProfile[] = []
      
      snapshot.forEach((doc) => {
        const data = doc.data() as any
        if (data.uid !== user?.id) { // Don't show current user
          results.push({
            uid: data.uid,
            username: data.username,
            profilePicture: data.profilePicture,
            bio: data.bio
          })
        }
      })
      
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const startConversation = async (otherUser: UserProfile) => {
    if (!user || !userProfile) return

    try {
      // Check if conversation already exists
      const existingQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.id)
      )
      
      const existingSnapshot = await getDocs(existingQuery)
      let existingConversation = null
      
      existingSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.participants.includes(otherUser.uid)) {
          existingConversation = doc.id
        }
      })

      if (existingConversation) {
        setSelectedConversation(existingConversation)
        setShowSearch(false)
        setSearchQuery('')
        return
      }

      // Create new conversation
      const conversationRef = await addDoc(collection(db, 'conversations'), {
        participants: [user.id, otherUser.uid],
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        participantUsernames: {
          [user.id]: userProfile.username,
          [otherUser.uid]: otherUser.username
        },
        participantProfilePictures: {
          [user.id]: null, // User type doesn't have profilePicture
          [otherUser.uid]: otherUser.profilePicture
        },
        unreadCount: {
          [user.id]: 0,
          [otherUser.uid]: 0
        },
        createdAt: serverTimestamp()
      })

      setSelectedConversation(conversationRef.id)
      setShowSearch(false)
      setSearchQuery('')
    } catch (error) {
      console.error('Error starting conversation:', error)
      alert('Failed to start conversation. Please try again.')
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access messages
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
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-200px)] flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            {showSearch && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    searchUsers(e.target.value)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {searchResults.map((result) => (
                      <button
                        key={result.uid}
                        onClick={() => startConversation(result)}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          {result.profilePicture ? (
                            <img src={result.profilePicture} alt={result.username} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span className="text-white text-sm font-medium">
                              {result.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{result.username}</p>
                          {result.bio && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.bio}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        {conversation.otherUser.profilePicture ? (
                          <img src={conversation.otherUser.profilePicture} alt={conversation.otherUser.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.otherUser.username}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {conversation.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conversation.lastMessage || 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      {conversations.find(c => c.id === selectedConversation)?.otherUser.profilePicture ? (
                        <img src={conversations.find(c => c.id === selectedConversation)?.otherUser.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {conversations.find(c => c.id === selectedConversation)?.otherUser.username}
                    </h3>
                  </div>
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-between mt-1 ${
                        message.senderId === user?.id ? 'text-orange-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <span className="text-xs">
                          {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.senderId === user?.id && (
                          <span className="text-xs ml-2">
                            {message.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)
                        if (e.target.value.length > MAX_MESSAGE_LENGTH) {
                          e.target.value = e.target.value.slice(0, MAX_MESSAGE_LENGTH)
                        }
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder={`Type a message... (${MAX_MESSAGE_LENGTH - newMessage.length} chars left)`}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      maxLength={MAX_MESSAGE_LENGTH}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || newMessage.length > MAX_MESSAGE_LENGTH}
                    size="sm"
                    className="px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {newMessage.length > MAX_MESSAGE_LENGTH * 0.8 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {MAX_MESSAGE_LENGTH - newMessage.length} characters remaining
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
                <p className="text-sm mt-2">Or search for users to start a new conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
} 