interface RateLimitData {
  count: number
  lastReset: number
  lastAction: number
}

class RateLimiter {
  private limits: Map<string, RateLimitData> = new Map()

  /**
   * Check if an action is allowed based on rate limits
   * @param key - Unique identifier for the rate limit (e.g., userId_action)
   * @param maxActions - Maximum number of actions allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if action is allowed, false if rate limited
   */
  checkRateLimit(key: string, maxActions: number, windowMs: number): boolean {
    const now = Date.now()
    const data = this.limits.get(key)

    if (!data) {
      // First action
      this.limits.set(key, {
        count: 1,
        lastReset: now,
        lastAction: now
      })
      return true
    }

    // Check if window has reset
    if (now - data.lastReset >= windowMs) {
      this.limits.set(key, {
        count: 1,
        lastReset: now,
        lastAction: now
      })
      return true
    }

    // Check if within limits
    if (data.count < maxActions) {
      this.limits.set(key, {
        ...data,
        count: data.count + 1,
        lastAction: now
      })
      return true
    }

    return false
  }

  /**
   * Get remaining actions for a rate limit
   * @param key - Unique identifier for the rate limit
   * @param maxActions - Maximum number of actions allowed
   * @param windowMs - Time window in milliseconds
   * @returns number of remaining actions
   */
  getRemainingActions(key: string, maxActions: number, windowMs: number): number {
    const now = Date.now()
    const data = this.limits.get(key)

    if (!data) {
      return maxActions
    }

    // Check if window has reset
    if (now - data.lastReset >= windowMs) {
      return maxActions
    }

    return Math.max(0, maxActions - data.count)
  }

  /**
   * Get time until rate limit resets
   * @param key - Unique identifier for the rate limit
   * @param windowMs - Time window in milliseconds
   * @returns milliseconds until reset, or 0 if not rate limited
   */
  getTimeUntilReset(key: string, windowMs: number): number {
    const now = Date.now()
    const data = this.limits.get(key)

    if (!data) {
      return 0
    }

    const timeSinceReset = now - data.lastReset
    return Math.max(0, windowMs - timeSinceReset)
  }

  /**
   * Clear rate limit data for a specific key
   * @param key - Unique identifier for the rate limit
   */
  clearRateLimit(key: string): void {
    this.limits.delete(key)
  }

  /**
   * Clear all rate limit data
   */
  clearAll(): void {
    this.limits.clear()
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter()

export default rateLimiter

// Predefined rate limit configurations
export const RATE_LIMITS = {
  PROFILE_PICTURE_CHANGE: {
    maxActions: 3,
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  POST_CREATION: {
    maxActions: 10,
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  MESSAGE_SENDING: {
    maxActions: 30,
    windowMs: 60 * 1000 // 1 minute
  },
  COMMUNITY_JOIN: {
    maxActions: 5,
    windowMs: 60 * 1000 // 1 minute
  }
} as const
