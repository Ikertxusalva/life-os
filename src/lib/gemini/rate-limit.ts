const MAX_REQUESTS_PER_MINUTE = 15
const WINDOW_MS = 60_000

const timestamps: number[] = []

function pruneOldEntries(): void {
  const cutoff = Date.now() - WINDOW_MS
  while (timestamps.length > 0 && timestamps[0] < cutoff) {
    timestamps.shift()
  }
}

export function checkRateLimit(): { allowed: boolean; retryAfter?: number } {
  pruneOldEntries()

  if (timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestInWindow = timestamps[0]
    const retryAfter = Math.ceil((oldestInWindow + WINDOW_MS - Date.now()) / 1000)
    return { allowed: false, retryAfter }
  }

  return { allowed: true }
}

export function recordRequest(): void {
  pruneOldEntries()
  timestamps.push(Date.now())
}
