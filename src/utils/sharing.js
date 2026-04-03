// Social sharing utilities for the Digital Wardrobe frontend

import { outfitToSlug, postToSlug } from './slugify'

// Production domain - always use this for sharing, not window.location.origin
// which could be a Vercel preview URL
const PRODUCTION_DOMAIN = 'https://emmanuellek.com'

/**
 * Generates a share URL for an outfit.
 * Accepts either a full outfit object (preferred, produces SEO-friendly slug)
 * or a plain string ID (backward-compatible).
 */
export const generateShareUrl = (outfitOrId, baseUrl = PRODUCTION_DOMAIN) => {
  const slug = typeof outfitOrId === 'string'
    ? outfitOrId
    : outfitToSlug(outfitOrId)
  return `${baseUrl}/outfits/${slug}`
}

export const generateShareText = (outfitTitle, influencerName = 'Emmanuelle K') => {
  return `Outfit "${outfitTitle}" - CuratedCloset`
}

/**
 * Generates a share URL for an editorial post.
 * Produces SEO-friendly slug URLs.
 */
export const generatePostShareUrl = (post, baseUrl = PRODUCTION_DOMAIN) => {
  const slug = postToSlug(post)
  return `${baseUrl}/editorial/${slug}`
}

export const generatePostShareText = (postTitle) => {
  return `"${postTitle}" - CuratedCloset`
}

export const shareToWhatsApp = (url, text) => {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
  window.open(whatsappUrl, '_blank', 'width=600,height=400')
}

export const shareToFacebook = (url, text) => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
  window.open(facebookUrl, '_blank', 'width=600,height=400')
}

export const shareToTwitter = (url, text) => {
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  window.open(twitterUrl, '_blank', 'width=600,height=400')
}

export const shareToInstagram = (url, text) => {
  // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
  const shareText = `${text} ${url}`
  navigator.clipboard.writeText(shareText).then(() => {
    alert('Lien copié ! Vous pouvez maintenant le coller dans votre story Instagram.')
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = shareText
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('Lien copié ! Vous pouvez maintenant le coller dans votre story Instagram.')
  })
}

export const shareToPinterest = (url, text, imageUrl) => {
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(text)}`
  window.open(pinterestUrl, '_blank', 'width=600,height=400')
}

export const copyToClipboard = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    alert('Lien copié dans le presse-papiers !')
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = url
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('Lien copié dans le presse-papiers !')
  })
}

export const shareToEmail = (url, text) => {
  const subject = 'CuratedCloset - Outfit Share'
  const body = `${text}\n\n${url}`
  const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = emailUrl
}

export const shareToTelegram = (url, text) => {
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  window.open(telegramUrl, '_blank', 'width=600,height=400')
}
