import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-transparent">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <Link 
            href="/rules" 
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Shiddit Rules
          </Link>
          <Link 
            href="/privacy" 
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/user-agreement" 
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            User Agreement
          </Link>
        </div>
        <div className="mt-1">
          <Link 
            href="/accessibility" 
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Accessibility
          </Link>
        </div>
        <div className="mt-1">
          <span className="text-gray-500 dark:text-gray-400">
            Shiddit, Inc. © 2025. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
} 