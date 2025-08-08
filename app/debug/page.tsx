'use client'

import { useState } from 'react'
import { uploadMedia } from '@/lib/cloudinary'
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/providers/AuthProvider'

export default function DebugPage() {
  const { user } = useAuth()
  const [testResult, setTestResult] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const testCloudinaryConfig = () => {
    const config = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`
    }
    
    setTestResult(JSON.stringify(config, null, 2))
  }

  const testDirectUpload = async () => {
    try {
      // Create a test file
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      const formData = new FormData()
      formData.append('file', testFile)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'shiddit_uploads')
      
      const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      setTestResult(JSON.stringify({ status: response.status, data }, null, 2))
    } catch (error: any) {
      setTestResult(JSON.stringify({ error: error.message }, null, 2))
    }
  }

  const testMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return
    
    const file = event.target.files[0]
    setUploading(true)
    
    try {
      const url = await uploadMedia(file, 'debug')
      setTestResult(JSON.stringify({ 
        success: true, 
        url: url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }, null, 2))
    } catch (error: any) {
      setTestResult(JSON.stringify({ 
        success: false, 
        error: error.message,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }, null, 2))
    } finally {
      setUploading(false)
    }
  }

  const testCommunities = async () => {
    try {
      const communitiesSnapshot = await getDocs(collection(db, 'communities'))
      const communities: any[] = []
      
      communitiesSnapshot.forEach((doc) => {
        const data = doc.data()
        communities.push({
          id: doc.id,
          name: data.name,
          displayName: data.displayName,
          description: data.description,
          memberCount: data.memberCount,
          creatorUsername: data.creatorUsername,
          createdAt: data.createdAt?.toDate?.() || data.createdAt
        })
      })
      
      setTestResult(JSON.stringify({ 
        success: true, 
        count: communities.length,
        communities: communities
      }, null, 2))
    } catch (error: any) {
      setTestResult(JSON.stringify({ 
        success: false, 
        error: error.message
      }, null, 2))
    }
  }

  const testCommunityMemberships = async () => {
    if (!user) {
      setTestResult(JSON.stringify({ 
        success: false, 
        error: 'User not logged in'
      }, null, 2))
      return
    }

    try {
      // Get all community memberships
      const membershipsSnapshot = await getDocs(collection(db, 'communityMembers'))
      const allMemberships: any[] = []
      
      membershipsSnapshot.forEach((doc) => {
        const data = doc.data()
        allMemberships.push({
          id: doc.id,
          userId: data.userId,
          communityId: data.communityId,
          username: data.username,
          role: data.role,
          joinedAt: data.joinedAt?.toDate?.() || data.joinedAt
        })
      })

      // Get user's specific memberships
      const userMembershipsQuery = query(
        collection(db, 'communityMembers'),
        where('userId', '==', user.uid)
      )
      const userMembershipsSnapshot = await getDocs(userMembershipsQuery)
      const userMemberships: any[] = []
      
      userMembershipsSnapshot.forEach((doc) => {
        const data = doc.data()
        userMemberships.push({
          id: doc.id,
          userId: data.userId,
          communityId: data.communityId,
          username: data.username,
          role: data.role,
          joinedAt: data.joinedAt?.toDate?.() || data.joinedAt
        })
      })
      
      setTestResult(JSON.stringify({ 
        success: true, 
        currentUser: user.uid,
        allMembershipsCount: allMemberships.length,
        userMembershipsCount: userMemberships.length,
        allMemberships: allMemberships,
        userMemberships: userMemberships
      }, null, 2))
    } catch (error: any) {
      setTestResult(JSON.stringify({ 
        success: false, 
        error: error.message
      }, null, 2))
    }
  }

  const fixCommunityMembership = async () => {
    if (!user) {
      setTestResult(JSON.stringify({ 
        success: false, 
        error: 'User not logged in'
      }, null, 2))
      return
    }

    try {
      // Get the community that the user created
      const communitiesSnapshot = await getDocs(collection(db, 'communities'))
      const userCommunity = communitiesSnapshot.docs.find(doc => 
        doc.data().creatorId === user.uid
      )

      if (!userCommunity) {
        setTestResult(JSON.stringify({ 
          success: false, 
          error: 'No community found for this user'
        }, null, 2))
        return
      }

      const communityData = userCommunity.data()
      
      // Check if membership already exists
      const existingMembershipQuery = query(
        collection(db, 'communityMembers'),
        where('userId', '==', user.uid),
        where('communityId', '==', userCommunity.id)
      )
      const existingMembershipSnapshot = await getDocs(existingMembershipQuery)
      
      if (!existingMembershipSnapshot.empty) {
        setTestResult(JSON.stringify({ 
          success: false, 
          error: 'Community membership already exists'
        }, null, 2))
        return
      }

      // Create the membership
      const membershipData = {
        communityId: userCommunity.id,
        userId: user.uid,
        username: communityData.creatorUsername,
        joinedAt: serverTimestamp(),
        role: 'creator'
      }
      
      const docRef = await addDoc(collection(db, 'communityMembers'), membershipData)
      
      setTestResult(JSON.stringify({ 
        success: true, 
        message: 'Community membership created successfully',
        membershipId: docRef.id,
        communityId: userCommunity.id,
        communityName: communityData.name
      }, null, 2))
    } catch (error: any) {
      setTestResult(JSON.stringify({ 
        success: false, 
        error: error.message
      }, null, 2))
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testCloudinaryConfig}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Cloudinary Config
        </button>
        
        <button 
          onClick={testDirectUpload}
          className="bg-green-500 text-white px-4 py-2 rounded ml-2"
        >
          Test Direct Upload
        </button>

        <button 
          onClick={testCommunities}
          className="bg-yellow-500 text-white px-4 py-2 rounded ml-2"
        >
          Test Communities
        </button>

        <button 
          onClick={testCommunityMemberships}
          className="bg-red-500 text-white px-4 py-2 rounded ml-2"
        >
          Test Community Memberships
        </button>

        <button 
          onClick={fixCommunityMembership}
          className="bg-purple-500 text-white px-4 py-2 rounded ml-2"
        >
          Fix Community Membership
        </button>

        <div className="flex items-center space-x-2">
          <label className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer">
            {uploading ? 'Uploading...' : 'Test Media Upload'}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={testMediaUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>
      
      {testResult && (
        <div className="bg-gray-100 p-4 rounded mt-4">
          <h2 className="font-bold mb-2">Test Results:</h2>
          <pre className="text-sm overflow-auto">{testResult}</pre>
        </div>
      )}
    </div>
  )
}
