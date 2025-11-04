/**
 * Normalize Dutch postal code (e.g., "1234 AB" or "1234ab" -> "1234AB")
 */
export function normalizePostalCode(postalCode: string): string {
  return postalCode.replace(/\s+/g, '').toUpperCase()
}

/**
 * Validate Dutch postal code format (1234 AB)
 */
export function isValidPostalCode(postalCode: string): boolean {
  const normalized = normalizePostalCode(postalCode)
  const pattern = /^\d{4}[A-Z]{2}$/
  return pattern.test(normalized)
}

/**
 * Case-insensitive, whitespace-tolerant search
 */
export function fuzzySearch(query: string, items: string[]): string[] {
  if (!query) return items

  const normalized = query.toLowerCase().trim()
  if (!normalized) return items

  return items.filter(item => item.toLowerCase().includes(normalized))
}

/**
 * Filter list of items with multiple conditions
 */
export function filterByMultipleCriteria<T>(
  items: T[],
  filters: Record<string, (item: T) => boolean>,
): T[] {
  return items.filter(item =>
    Object.values(filters).every(predicate => predicate(item)),
  )
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  // Simplified email validation
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

/**
 * Validate name (basic: not empty, not just spaces)
 */
export function isValidName(name: string): boolean {
  return name.trim().length > 0
}

/**
 * Calculate simple distance between two points (lat/lng)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return Math.round(km * 1000) + ' m'
  }
  return km.toFixed(1) + ' km'
}
