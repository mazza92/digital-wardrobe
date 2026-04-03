/** Same-origin relative path only — blocks open redirects */
export function getSafeRedirectPath (raw) {
  if (raw == null || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  if (/^\/\/+/u.test(trimmed)) return null
  if (trimmed.includes('\\')) return null
  try {
    if (trimmed.includes(':')) return null
  } catch {
    return null
  }
  return trimmed
}

export const POST_LOGIN_REDIRECT_KEY = 'dw_post_login_redirect'
