'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLogin } from '@/components/providers/LoginProvider'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import MainLayout from '@/components/layout/MainLayout'
import { Crown, CheckCircle, Copy, X, ExternalLink, AlertCircle } from 'lucide-react'

const VERIFICATION_COST = 30000
const PAYMENT_ADDRESS = 'Fb8VueYS3dqxqxB7oSvkyEhJWehyv8vgTtVk19ZfiquJ'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
}

function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [senderAddress, setSenderAddress] = useState('')
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [waitingForPayment, setWaitingForPayment] = useState(false)
  const [verificationStep, setVerificationStep] = useState<'initial' | 'payment' | 'confirmation'>('initial')

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const openJupiter = () => {
    window.open(`https://jup.ag/swap/SOL-ESBCnCXtEZDmX8QnHU6qMZXd9mvjSAZVoYaLKKADBAGS`, '_blank', 'noopener,noreferrer')
  }

  const handlePaymentConfirmation = async () => {
    if (!user || !senderAddress) return
    
    setUpdating(true)
    try {
      // Update user profile to indicate waiting for payment
      await updateDoc(doc(db, 'users', user.uid), {
        waitingForPayment: true,
        senderAddress: senderAddress,
        paymentRequestedAt: new Date(),
        verificationStep: 'payment'
      })
      
      setWaitingForPayment(true)
      setVerificationStep('payment')
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 3000)
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Failed to update payment status. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handleManualPaymentConfirmation = async () => {
    if (!user) return
    
    setUpdating(true)
    try {
      // Update user profile with premium status (manual confirmation)
      await updateDoc(doc(db, 'users', user.uid), {
        isPremium: true,
        isVerified: true,
        premiumSince: new Date(),
        waitingForPayment: false,
        paymentConfirmedAt: new Date(),
        verificationStep: 'confirmation',
        verificationStatus: 'verified'
      })
      
      setPaymentConfirmed(true)
      setVerificationStep('confirmation')
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 3000)
    } catch (error) {
      console.error('Error updating premium status:', error)
      alert('Failed to update premium status. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Get Verified Farter Badge
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Verification Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
            Become a Verified Farter
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            Get your blue checkmark and stand out in the community with official verification status.
          </p>

          {/* Cost */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Cost: {VERIFICATION_COST.toLocaleString()} $SHIT
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This is a one-time payment to verify your account permanently.
            </p>
          </div>

          {/* Sender Address */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
              Your wallet address (where you're sending from):
            </label>
            <input
              type="text"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              placeholder="Enter your wallet address"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Payment Address */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
              Send payment to:
            </label>
            <div className="relative">
              <input
                type="text"
                value={PAYMENT_ADDRESS}
                readOnly
                className="w-full px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm font-mono text-gray-900 dark:text-white"
              />
              <button
                onClick={copyAddress}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Verification Steps */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                verificationStep === 'initial' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <span className={`text-sm ${verificationStep === 'initial' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Enter wallet address
              </span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                verificationStep === 'payment' ? 'bg-orange-500 text-white' : verificationStep === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
              }`}>
                2
              </div>
              <span className={`text-sm ${verificationStep === 'payment' ? 'text-gray-900 dark:text-white' : verificationStep === 'confirmation' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                Send payment
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                verificationStep === 'confirmation' ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
              }`}>
                3
              </div>
              <span className={`text-sm ${verificationStep === 'confirmation' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Get verified
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={openJupiter}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Get $SHIT Tokens
            </button>

            {senderAddress && !waitingForPayment && (
              <button
                onClick={handlePaymentConfirmation}
                disabled={updating}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {updating ? 'Processing...' : 'Pay'}
              </button>
            )}

            {waitingForPayment && (
              <div className="space-y-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                      Waiting for payment confirmation. Please send {VERIFICATION_COST.toLocaleString()} $SHIT tokens to the address above.
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleManualPaymentConfirmation}
                  disabled={updating}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {updating ? 'Confirming...' : 'Confirm Payment Received'}
                </button>
              </div>
            )}

            {paymentConfirmed && !waitingForPayment && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Payment confirmed! Your verification badge has been applied.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PremiumPage() {
  const { user, userProfile } = useAuth()
  const { showLoginPopup } = useLogin()
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access premium features
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Crown className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Premium Features
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Unlock exclusive features and stand out in the community
          </p>
        </div>

        {/* Premium Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Verified Badge */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Verified Badge
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get the blue checkmark
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {userProfile?.isPremium ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Verified
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Not verified
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Stand out in the community with an official verification badge. 
              Show other users that you're a trusted member of the platform.
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Blue checkmark on your profile</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Verified status in comments</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Priority in community features</span>
              </li>
            </ul>

            {userProfile?.isPremium ? (
              <div className="w-full bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    You are verified! Premium features are active.
                  </span>
                </div>
              </div>
            ) : userProfile?.waitingForPayment ? (
              <div className="w-full bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    Payment pending. Please complete your transaction.
                  </span>
                </div>
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Complete Payment
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowVerificationModal(true)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Get Verified - {VERIFICATION_COST.toLocaleString()} $SHIT
              </button>
            )}
          </div>

          {/* Premium Membership */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Premium Membership
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Coming Soon
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                Soon
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Unlock exclusive features and enhanced capabilities with our premium membership.
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Ad-free experience</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Advanced posting features</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Priority support</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* How to Get $SHIT */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            How to Get $SHIT Tokens
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <ExternalLink className="w-6 h-6 text-orange-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Buy on Jupiter
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Swap SOL for $SHIT tokens using Jupiter aggregator
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Earn by Participating
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get rewarded for creating quality content and engaging with the community
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Community Rewards
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive tokens for being an active and valuable community member
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Important Security Notice
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Only send payments to the official address shown above. Never share your private keys or seed phrase. 
                Verification is permanent and cannot be refunded. Always verify the address before sending any tokens.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Modal */}
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
        />
      </div>
    </MainLayout>
  )
}
