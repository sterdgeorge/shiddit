export const APP_NAME = 'Shiddit'
export const APP_DESCRIPTION = 'A Shiddit-style platform for sharing and discussing content'

export const NAVIGATION_ITEMS = [
  { name: 'Feed', href: '/', icon: 'Home' },
  { name: 'Leaderboard', href: '/leaderboard', icon: 'Trophy' },
  { name: 'Settings', href: '/settings', icon: 'Settings' },
]

export const ACTION_ITEMS = [
  { name: 'Create Post', href: '/create-post', icon: 'Plus' },
  { name: 'Create Community', href: '/create-community', icon: 'Hash' },
]

export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  COMMUNITIES: 'communities',
  USERNAMES: 'usernames',
} as const

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
  },
  POST: {
    TITLE_MAX_LENGTH: 300,
    CONTENT_MAX_LENGTH: 10000,
  },
  COMMUNITY: {
    NAME_MAX_LENGTH: 21,
    DESCRIPTION_MAX_LENGTH: 500,
  },
} as const

// Admin configuration for local testing
export const ADMIN_CREDENTIALS = {
  EMAIL: 'admin@shiddit.com',
  PASSWORD: 'admin123',
  USERNAME: 'admin',
} as const

export const ADMIN_FEATURES = {
  CAN_DELETE_ANY_POST: true,
  CAN_DELETE_ANY_COMMUNITY: true,
  CAN_BAN_USERS: true,
  CAN_VIEW_ALL_DATA: true,
} as const 