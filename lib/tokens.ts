import { db } from './firebase'
import { collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, doc, getDoc } from 'firebase/firestore'

export interface Token {
  id: string
  name: string
  symbol: string
  description: string
  contractAddress: string
  launchpad: 'pump.fun' | 'bonk'
  marketCap: number
  price: number
  volume24h: number
  holders: number
  launchDate: Date
  creatorId: string
  creatorUsername: string
  imageUrl?: string
  websiteUrl?: string
  communityId?: string
  communityName?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateTokenData {
  name: string
  symbol: string
  description: string
  contractAddress: string
  launchpad: 'pump.fun' | 'bonk'
  marketCap: number
  price: number
  volume24h: number
  holders: number
  creatorId: string
  creatorUsername: string
  imageUrl?: string
  websiteUrl?: string
  communityId?: string
  communityName?: string
}

export const createToken = async (tokenData: CreateTokenData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'tokens'), {
      ...tokenData,
      launchDate: new Date(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error('Error creating token:', error)
    throw new Error('Failed to create token')
  }
}

export const getTokens = async (): Promise<Token[]> => {
  try {
    const tokensRef = collection(db, 'tokens')
    const q = query(tokensRef, orderBy('marketCap', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const tokens: Token[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tokens.push({
        id: doc.id,
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        contractAddress: data.contractAddress,
        launchpad: data.launchpad,
        marketCap: data.marketCap || 0,
        price: data.price || 0,
        volume24h: data.volume24h || 0,
        holders: data.holders || 0,
        launchDate: data.launchDate?.toDate() || new Date(),
        creatorId: data.creatorId,
        creatorUsername: data.creatorUsername,
        imageUrl: data.imageUrl,
        websiteUrl: data.websiteUrl,
        communityId: data.communityId,
        communityName: data.communityName,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      })
    })
    
    return tokens
  } catch (error) {
    console.error('Error fetching tokens:', error)
    throw new Error('Failed to fetch tokens')
  }
}

export const getTokenById = async (tokenId: string): Promise<Token | null> => {
  try {
    const tokenDoc = await getDoc(doc(db, 'tokens', tokenId))
    
    if (!tokenDoc.exists()) {
      return null
    }
    
    const data = tokenDoc.data()
    return {
      id: tokenDoc.id,
      name: data.name,
      symbol: data.symbol,
      description: data.description,
      contractAddress: data.contractAddress,
      launchpad: data.launchpad,
      marketCap: data.marketCap || 0,
      price: data.price || 0,
      volume24h: data.volume24h || 0,
      holders: data.holders || 0,
      launchDate: data.launchDate?.toDate() || new Date(),
      creatorId: data.creatorId,
      creatorUsername: data.creatorUsername,
      imageUrl: data.imageUrl,
      websiteUrl: data.websiteUrl,
      communityId: data.communityId,
      communityName: data.communityName,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
  } catch (error) {
    console.error('Error fetching token:', error)
    throw new Error('Failed to fetch token')
  }
}

export const getTokensByCreator = async (creatorId: string): Promise<Token[]> => {
  try {
    const tokensRef = collection(db, 'tokens')
    const q = query(tokensRef, where('creatorId', '==', creatorId), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const tokens: Token[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tokens.push({
        id: doc.id,
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        contractAddress: data.contractAddress,
        launchpad: data.launchpad,
        marketCap: data.marketCap || 0,
        price: data.price || 0,
        volume24h: data.volume24h || 0,
        holders: data.holders || 0,
        launchDate: data.launchDate?.toDate() || new Date(),
        creatorId: data.creatorId,
        creatorUsername: data.creatorUsername,
        imageUrl: data.imageUrl,
        websiteUrl: data.websiteUrl,
        communityId: data.communityId,
        communityName: data.communityName,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      })
    })
    
    return tokens
  } catch (error) {
    console.error('Error fetching tokens by creator:', error)
    throw new Error('Failed to fetch tokens by creator')
  }
}
