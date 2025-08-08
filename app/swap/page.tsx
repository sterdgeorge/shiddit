'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import MainLayout from '@/components/layout/MainLayout'
import { ArrowLeftRight, ExternalLink, AlertCircle, CheckCircle, Copy } from 'lucide-react'

const TOKEN_CONTRACT_ADDRESS = 'GETREADY'
const JUPITER_IFRAME_URL = 'https://jup.ag/swap/SOL-GETREADY?inputMint=So11111111111111111111111111111111111111112&outputMint=GETREADY'
const STORE_ADDRESS = 'GETREADY'

export default function SwapPage() {
  const { user } = useAuth()
  const { showLoginPopup } = useLogin()
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  const handleIframeLoad = () => {
    setIframeLoaded(true)
    setIframeError(false)
  }

  const handleIframeError = () => {
    setIframeError(true)
    setIframeLoaded(false)
  }

  const openJupiterInNewTab = () => {
    window.open(JUPITER_IFRAME_URL, '_blank', 'noopener,noreferrer')
  }

  const handleCopyCA = async () => {
    try {
      await navigator.clipboard.writeText(TOKEN_CONTRACT_ADDRESS)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access the token swap
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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <ArrowLeftRight className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Swap Tokens
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Swap SOL and other tokens for $SHIT using Jupiter
          </p>
        </div>

        {/* Token Info Card */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                $SHIT Token
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Contract Address: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                  {TOKEN_CONTRACT_ADDRESS}
                </code>
                <button
                  onClick={handleCopyCA}
                  className="ml-2 inline-flex items-center space-x-1 text-orange-500 hover:text-orange-600 transition-colors"
                  title="Copy contract address"
                >
                  <Copy className="w-3 h-3" />
                  <span className="text-xs">Copy CA</span>
                </button>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Powered by Jupiter - The best aggregator for Solana
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Verified Token
              </span>
            </div>
          </div>
        </div>

        {/* Jupiter Swap Interface */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Swap Interface
            </h2>
            <button
              onClick={openJupiterInNewTab}
              className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab</span>
            </button>
          </div>

          {/* Loading State */}
          {!iframeLoaded && !iframeError && (
            <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading Jupiter Swap...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {iframeError && (
            <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Failed to Load Swap Interface
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  There was an error loading the Jupiter swap interface.
                </p>
                <div className="space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={openJupiterInNewTab}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Open Jupiter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Jupiter Iframe */}
          <iframe
            src={JUPITER_IFRAME_URL}
            className={`w-full h-[600px] border-0 rounded-lg transition-opacity duration-300 ${
              iframeLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Jupiter Token Swap"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        {/* Instructions */}
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How to Swap
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Step 1: Connect Wallet
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Make sure you have a Solana wallet (like Phantom, Solflare, or Backpack) connected to your browser.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Step 2: Select Tokens
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose the token you want to swap from (like SOL) and $SHIT as the token you want to receive.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Step 3: Enter Amount
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the amount you want to swap. The interface will show you the estimated $SHIT you'll receive.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Step 4: Execute Swap
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review the transaction details and click "Swap" to execute the transaction through your wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="card p-6 mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Security Notice
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This swap interface is powered by Jupiter, a trusted and secure aggregator for Solana. 
                Always verify the contract address and transaction details before confirming any swap. 
                Never share your private keys or seed phrase with anyone.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Useful Links
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://jup.ag"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Jupiter Homepage
              </span>
            </a>
            <a
              href={`https://solscan.io/token/${TOKEN_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                View on Solscan
              </span>
            </a>
            <a
              href={`https://dexscreener.com/solana/${TOKEN_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                View on DexScreener
              </span>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
