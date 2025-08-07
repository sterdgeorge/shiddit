import { VALIDATION_RULES } from './constants'

export const validateUsername = (username: string): string | null => {
  if (!username) return 'Username is required'
  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    return `Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`
  }
  if (username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
    return `Username must be no more than ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`
  }
  if (!VALIDATION_RULES.USERNAME.PATTERN.test(username)) {
    return 'Username can only contain letters, numbers, and underscores'
  }
  return null
}

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`
  }
  return null
}

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  return null
}

export const validatePostTitle = (title: string): string | null => {
  if (!title) return 'Title is required'
  if (title.length > VALIDATION_RULES.POST.TITLE_MAX_LENGTH) {
    return `Title must be no more than ${VALIDATION_RULES.POST.TITLE_MAX_LENGTH} characters`
  }
  return null
}

export const validatePostContent = (content: string): string | null => {
  if (!content) return 'Content is required'
  if (content.length > VALIDATION_RULES.POST.CONTENT_MAX_LENGTH) {
    return `Content must be no more than ${VALIDATION_RULES.POST.CONTENT_MAX_LENGTH} characters`
  }
  return null
}

export const validateCommunityName = (name: string): string | null => {
  if (!name) return 'Community name is required'
  if (name.length > VALIDATION_RULES.COMMUNITY.NAME_MAX_LENGTH) {
    return `Community name must be no more than ${VALIDATION_RULES.COMMUNITY.NAME_MAX_LENGTH} characters`
  }
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return 'Community name can only contain letters, numbers, and underscores'
  }
  return null
}

export const validateCommunityDescription = (description: string): string | null => {
  if (!description) return 'Description is required'
  if (description.length > VALIDATION_RULES.COMMUNITY.DESCRIPTION_MAX_LENGTH) {
    return `Description must be no more than ${VALIDATION_RULES.COMMUNITY.DESCRIPTION_MAX_LENGTH} characters`
  }
  return null
} 