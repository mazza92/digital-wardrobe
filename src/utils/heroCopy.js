/**
 * Hero headline + tagline from admin profile API only.
 * English: only *_En fields (no i18n fallbacks — avoids duplicate “marketing” strings in the repo).
 * Other languages: primary fields from API, then i18n fallbacks when empty.
 */

function isEn(language) {
  return (language || '').toLowerCase().startsWith('en')
}

export function resolveHeroCuratedBy(language, influencer, t) {
  if (isEn(language)) {
    return influencer?.heroCuratedByEn?.trim() || ''
  }
  const s = influencer?.heroCuratedBy?.trim()
  if (s) return s
  return t('hero.curatedBy')
}

export function resolveHeroTagline(language, influencer, t) {
  if (isEn(language)) {
    return influencer?.heroTaglineEn?.trim() || ''
  }
  const s = influencer?.heroTagline?.trim()
  if (s) return s
  return t('hero.tagline')
}
