'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Coins, TrendingUp, TrendingDown, ExternalLink, Users, Calendar, DollarSign, BarChart3 } from 'lucide-react'
import { getTokens, Token } from '@/lib/tokens'

// Using the Token interface from lib/tokens instead of ShitCoin

export default function ShitCoinsPage() {
  const [coins, setCoins] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'marketCap' | 'volume24h' | 'holders' | 'launchDate'>('marketCap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCoins()
  }, [])

  const fetchCoins = async () => {
    try {
      const tokens = await getTokens()
      setCoins(tokens)
    } catch (error) {
      console.error('Error fetching coins:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`
    }
    return `$${num.toFixed(0)}`
  }

  const formatPrice = (price: number): string => {
    if (price < 0.000001) {
      return `$${price.toExponential(2)}`
    }
    return `$${price.toFixed(6)}`
  }

  const sortedCoins = [...coins]
    .filter(coin => 
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'marketCap':
          aValue = a.marketCap
          bValue = b.marketCap
          break
        case 'volume24h':
          aValue = a.volume24h
          bValue = b.volume24h
          break
        case 'holders':
          aValue = a.holders
          bValue = b.holders
          break
        case 'launchDate':
          aValue = a.launchDate.getTime()
          bValue = b.launchDate.getTime()
          break
        default:
          aValue = a.marketCap
          bValue = b.marketCap
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Coins className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Shit Coins
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              All coins launched on Shiddit, ranked by market cap
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Coins</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{coins.length}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Market Cap</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(coins.reduce((sum, coin) => sum + coin.marketCap, 0))}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Holders</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {coins.reduce((sum, coin) => sum + coin.holders, 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">24h Volume</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(coins.reduce((sum, coin) => sum + coin.volume24h, 0))}
            </p>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search coins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleSort('marketCap')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'marketCap'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => handleSort('volume24h')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'volume24h'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => handleSort('holders')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'holders'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Holders
            </button>
          </div>
        </div>

        {/* Coins List */}
        <div className="space-y-4">
          {sortedCoins.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No coins found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms.' : 'No coins have been launched yet.'}
              </p>
            </div>
          ) : (
            sortedCoins.map((coin, index) => (
              <div key={coin.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  {/* Coin Info */}
                  <div className="flex items-start space-x-4">
                    {/* Rank */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-orange-500">
                      {index + 1}
                    </div>
                    
                    {/* Coin Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {coin.name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {coin.symbol}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          coin.launchpad === 'pump.fun' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                          {coin.launchpad === 'pump.fun' ? 'pump.fun' : 'letsbonk.fun'}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {coin.description}
                      </p>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatNumber(coin.marketCap)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatPrice(coin.price)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatNumber(coin.volume24h)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Holders</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {coin.holders.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Launched {coin.launchDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <a
                            href={`/user/${coin.creatorUsername}`}
                            className="text-orange-500 hover:text-orange-600 transition-colors"
                          >
                            by {coin.creatorUsername}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {coin.websiteUrl && (
                      <a
                        href={coin.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        title="Website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {coin.communityId && (
                      <a
                        href={`/s/${coin.communityName}`}
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        View Community
                      </a>
                    )}
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
