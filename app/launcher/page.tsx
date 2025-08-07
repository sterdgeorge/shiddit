'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import MainLayout from '@/components/layout/MainLayout'
import { Rocket, Upload, Copy, CheckCircle, X, ExternalLink, AlertCircle, Users, BarChart3, User } from 'lucide-react'

interface TokenForm {
  name: string
  symbol: string
  description: string
  twitterUrl: string
  telegramUrl: string
  websiteUrl: string
  devBuyAmount: number
  launchpad: 'pump.fun' | 'bonk'
  createCommunity: boolean
  contractSuffix: string
}

interface WalletInfo {
  address: string
  connected: boolean
  balance: number
}

export default function LauncherPage() {
  const { user } = useAuth()
  const { showLoginPopup } = useLogin()
  
  const [form, setForm] = useState<TokenForm>({
    name: '',
    symbol: '',
    description: '',
    twitterUrl: '',
    telegramUrl: '',
    websiteUrl: '',
    devBuyAmount: 1,
    launchpad: 'pump.fun',
    createCommunity: false,
    contractSuffix: ''
  })
  
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: '',
    connected: false,
    balance: 0
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user has premium badge (placeholder for now)
  const hasPremiumBadge = false

  const handleInputChange = (field: keyof TokenForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
        setErrors(prev => ({ ...prev, image: '' }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!form.name.trim()) {
      newErrors.name = 'Token name is required'
    } else if (form.name.length > 32) {
      newErrors.name = 'Token name must be 32 characters or less'
    } else if (!form.name.toLowerCase().endsWith('shit')) {
      newErrors.name = 'Token name must end with "shit"'
    }

    if (!form.symbol.trim()) {
      newErrors.symbol = 'Token symbol is required'
    } else if (form.symbol.length > 10) {
      newErrors.symbol = 'Token symbol must be 10 characters or less'
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (form.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    if (form.devBuyAmount < 0 || form.devBuyAmount > 10) {
      newErrors.devBuyAmount = 'Dev buy amount must be between 0 and 10 SOL'
    }

    if (!walletInfo.connected) {
      newErrors.wallet = 'Please connect your wallet'
    }

    if (walletInfo.balance < form.devBuyAmount) {
      newErrors.balance = 'Insufficient SOL balance'
    }

    // Validate that contract address will end with "shit"
    if (!form.contractSuffix || !form.contractSuffix.toLowerCase().endsWith('shit')) {
      newErrors.contractSuffix = 'Contract address must end with "shit"'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const connectWallet = async () => {
    try {
      // Check if Phantom wallet is available
      if (typeof window !== 'undefined' && 'solana' in window) {
        const provider = (window as any).solana
        
        if (provider.isPhantom) {
          const response = await provider.connect()
          const address = response.publicKey.toString()
          
          // Get balance
          const balance = await provider.getBalance()
          
          setWalletInfo({
            address: `${address.slice(0, 4)}...${address.slice(-4)}`,
            connected: true,
            balance: balance / 1e9 // Convert lamports to SOL
          })
          
          setErrors(prev => ({ ...prev, wallet: '' }))
        } else {
          setErrors(prev => ({ ...prev, wallet: 'Please install Phantom wallet' }))
        }
      } else {
        setErrors(prev => ({ ...prev, wallet: 'Please install Phantom wallet' }))
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      setErrors(prev => ({ ...prev, wallet: 'Failed to connect wallet' }))
    }
  }

  const launchToken = async () => {
    if (!validateForm()) return

    setLoading(true)
    
    try {
      // Simulate token launch process with vanity address generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate vanity contract address ending with the specified suffix
      const vanityAddress = await generateVanityAddress(form.contractSuffix)
      
      // Here you would integrate with the actual launchpad APIs
      const launchpadUrl = form.launchpad === 'pump.fun' 
        ? `https://pump.fun/create?vanity=${encodeURIComponent(vanityAddress)}` 
        : `https://bonk.launchpad.com/create?vanity=${encodeURIComponent(vanityAddress)}`
      
      // Open launchpad in new tab
      window.open(launchpadUrl, '_blank', 'noopener,noreferrer')
      
      // Show success message with vanity address
      alert(`Token launch initiated!\n\nVanity Contract Address: ${vanityAddress}\n\nCheck the launchpad for further steps.`)
      
    } catch (error) {
      console.error('Error launching token:', error)
      setErrors(prev => ({ ...prev, general: 'Failed to launch token. Please try again.' }))
    } finally {
      setLoading(false)
    }
  }

  const generateVanityAddress = async (suffix: string): Promise<string> => {
    // This is a simplified simulation - in reality, you'd use a proper vanity address generator
    // For now, we'll simulate generating an address that ends with the specified suffix
    
    // Simulate the generation process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate a mock address that ends with the suffix
    const randomPrefix = Math.random().toString(36).substring(2, 10).toUpperCase()
    const vanityAddress = `${randomPrefix}${suffix.toUpperCase()}`
    
    return vanityAddress
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletInfo.address)
      // Show copied feedback
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access the coin launcher
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

  if (!hasPremiumBadge) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Rocket className="w-6 h-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Shit Launcher
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Launch your own coin on pump.fun and bonk
            </p>
          </div>

          {/* Premium Badge Required */}
          <div className="card p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Rocket className="w-8 h-8 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Premium Badge Required
              </h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get verified to launch your own coins on Shitbook!
            </p>

            <div className="text-left max-w-md mx-auto mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Premium benefits:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Launch unlimited coins on pump.fun</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Create communities for your coins</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Verified badge on your profile</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowPremiumModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Get Premium Badge
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Rocket className="w-6 h-6 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Shit Launcher
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Launch your own coin on pump.fun and bonk
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Coin Launcher</p>
              <p className="text-lg font-bold text-orange-500">Ready to Launch</p>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Wallet Connection
          </h2>
          
          {walletInfo.connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Wallet connected: {walletInfo.address}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Balance: {walletInfo.balance.toFixed(4)} SOL
                  </p>
                </div>
              </div>
              <button
                onClick={copyAddress}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
              >
                Copy Address
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Connect your wallet to launch tokens
              </p>
              <button
                onClick={connectWallet}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          )}
          
          {errors.wallet && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.wallet}</span>
            </p>
          )}
        </div>

        {/* Token Creation Form */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Token Image
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); launchToken(); }} className="space-y-6">
            {/* Token Image */}
            <div className="flex items-center space-x-4">
              <div 
                className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Token" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Rocket className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            {errors.image && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.image}</span>
              </p>
            )}

            {/* Token Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field"
                  placeholder="e.g., FartCoin"
                  maxLength={32}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {form.name.length}/32 characters
                </p>
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                  className="input-field"
                  placeholder="e.g., FART"
                  maxLength={10}
                />
                {errors.symbol && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.symbol}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Describe your token..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {form.description.length}/500 characters
              </p>
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
              )}
            </div>

            {/* URLs */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={form.twitterUrl}
                  onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                  className="input-field"
                  placeholder="https://x.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telegram URL
                </label>
                <input
                  type="url"
                  value={form.telegramUrl}
                  onChange={(e) => handleInputChange('telegramUrl', e.target.value)}
                  className="input-field"
                  placeholder="https://t.me/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
            </div>

                         {/* Dev Buy Amount */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Dev Buy Amount (SOL)
               </label>
               <input
                 type="number"
                 value={form.devBuyAmount}
                 onChange={(e) => handleInputChange('devBuyAmount', parseFloat(e.target.value) || 0)}
                 className="input-field"
                 min="0"
                 max="10"
                 step="0.1"
               />
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                 Amount of SOL to buy initially (0 - 10 SOL)
               </p>
               {errors.devBuyAmount && (
                 <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.devBuyAmount}</p>
               )}
             </div>

             {/* Contract Address Suffix */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Contract Address Suffix *
               </label>
               <input
                 type="text"
                 value={form.contractSuffix}
                 onChange={(e) => handleInputChange('contractSuffix', e.target.value)}
                 className="input-field"
                 placeholder="e.g., FartShit, MemeShit"
                 maxLength={20}
               />
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                 Your contract address will end with this suffix (must end with "shit")
               </p>
               {errors.contractSuffix && (
                 <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.contractSuffix}</p>
               )}
             </div>

            {/* Launchpad Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose your launchpad:
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="launchpad"
                    value="pump.fun"
                    checked={form.launchpad === 'pump.fun'}
                    onChange={(e) => handleInputChange('launchpad', e.target.value)}
                    className="text-orange-500"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">pump.fun</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="launchpad"
                    value="bonk"
                    checked={form.launchpad === 'bonk'}
                    onChange={(e) => handleInputChange('launchpad', e.target.value)}
                    className="text-orange-500"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🐕</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">letsbonk.fun</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Community Creation */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="createCommunity"
                checked={form.createCommunity}
                onChange={(e) => handleInputChange('createCommunity', e.target.checked)}
                className="text-orange-500"
              />
              <label htmlFor="createCommunity" className="flex items-center space-x-2 cursor-pointer">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Create Community for this coin
                </span>
              </label>
            </div>

            {/* Error Messages */}
            {errors.general && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.general}</span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !walletInfo.connected}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Launch Coin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
