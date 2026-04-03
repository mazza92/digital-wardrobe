/**
 * Converts a string to a URL-safe slug.
 * Handles French accents (é→e, à→a, etc.) and special characters.
 */
export function slugify(text) {
  if (!text) return ''
  return text
    .normalize('NFD')                     // decompose accented chars (é → e + combining accent)
    .replace(/[\u0300-\u036f]/g, '')      // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')        // keep only alphanumeric, spaces, dashes
    .trim()
    .replace(/\s+/g, '-')                 // spaces → dashes
    .replace(/-+/g, '-')                  // collapse consecutive dashes
    .replace(/^-+|-+$/g, '')             // trim leading/trailing dashes
}

/**
 * Generates a SEO-friendly URL slug for an outfit.
 * New format: {title-slug}
 * Example: "tenue-d-ete-fleurie"
 *
 * If title is missing, fallback to id for robustness.
 */
export function outfitToSlug(outfit) {
  const title = outfit.title || outfit.titleEn || ''
  const titleSlug = slugify(title)
  return titleSlug || outfit.id
}

/**
 * Extracts an outfit id from route param when present.
 * Handles old formats for backward compatibility:
 *   - Pure CUID:  "cmlwak0hr0009k004cztheskf"          (old URLs)
 *   - Slug+CUID: "tenue-d-ete-fleurie-cmlwak0hr0009k004cztheskf" (new URLs)
 * New clean slugs ("tenue-d-ete-fleurie") return as-is and should
 * be resolved by matching slug against outfit title slug.
 *
 * CUIDs are 25 characters: starts with 'c', followed by 24 lowercase alphanumeric chars.
 */
export function slugToOutfitId(param) {
  if (!param) return param

  // Old format: bare CUID with no prefix
  if (/^c[a-z0-9]{24}$/.test(param)) return param

  // New format: extract last 25 chars which must be the CUID
  const last25 = param.slice(-25)
  if (/^c[a-z0-9]{24}$/.test(last25)) return last25

  // Fallback — return as-is (handles edge cases gracefully)
  return param
}

/** True if string is a Prisma/DB outfit id (CUID), not a title slug */
export function isOutfitDbId(id) {
  return typeof id === 'string' && /^c[a-z0-9]{24}$/.test(id)
}

/**
 * Generates a SEO-friendly URL slug for an editorial post.
 * Format: {title-slug}
 * Example: "tendances-printemps-2024"
 */
export function postToSlug(post) {
  const title = post.title || post.titleEn || ''
  const titleSlug = slugify(title)
  return titleSlug || post.id
}
