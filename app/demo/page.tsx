'use client'

import MainLayout from '@/components/layout/MainLayout'
import Button from '@/components/ui/Button'
import { ArrowRight, Vote, Users, TrendingUp, Award, MessageSquare } from 'lucide-react'

export default function DemoPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Shiddit
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            A Reddit-style platform with voting, communities, and karma system
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="btn-primary">
              Explore Posts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline">
              View Leaderboard
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <Vote className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Voting System
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upvote and downvote posts to control visibility. Posts with higher scores rise to the top.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <Users className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Communities
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Join communities (subreddits) and create your own. Each has its own rules and moderators.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <TrendingUp className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Karma System
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Earn karma through upvotes. Separate post karma and comment karma tracking.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <Award className="w-8 h-8 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Leaderboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Top posts appear on the leaderboard. Compete to get your content featured.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Feed Sorting
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sort by Hot, New, Top, Controversial, or Rising. Different algorithms for different content.
            </p>
          </div>

                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
             <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4">
               <img 
                 src="/icon.jpg" 
                 alt="Shiddit Logo" 
                 className="w-8 h-8 rounded-lg object-cover"
               />
             </div>
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
               Dark Mode
             </h3>
             <p className="text-gray-600 dark:text-gray-400">
               Dark mode is the default theme. Seamless switching between light and dark modes.
             </p>
           </div>
        </div>

        {/* How to Use */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            How to Get Started
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Login as Admin</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Use <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">admin@shiddit.com</code> / <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">admin123</code>
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Explore the Feed</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check out the sample posts with voting buttons on the left side
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Try Different Sorts</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Use the sorting buttons (Hot, New, Top, etc.) to see different post orders
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Visit Leaderboard</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See the top posts ranked by score with ranking badges
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Experience the full Reddit-style interface with voting, sorting, and karma system
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="btn-primary">
              Go to Feed
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline">
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 