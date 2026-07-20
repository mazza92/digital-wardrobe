/**
 * Get the appropriate outfit title based on current language
 * @param {Object} outfit - The outfit object with title and titleEn
 * @param {string} language - Current language ('fr' or 'en')
 * @returns {string} - The title in the appropriate language
 */
export const getOutfitTitle = (outfit, language = 'fr') => {
  if (!outfit) return ''

  // If language is English and titleEn exists, use it
  if (language === 'en' && outfit.titleEn) {
    return outfit.titleEn
  }

  // Otherwise, fall back to French title
  return outfit.title || ''
}

/**
 * Get the appropriate outfit description based on current language
 * @param {Object} outfit - The outfit object with description and descriptionEn
 * @param {string} language - Current language ('fr' or 'en')
 * @returns {string} - The description in the appropriate language
 */
export const getOutfitDescription = (outfit, language = 'fr') => {
  if (!outfit) return ''

  // If language is English and descriptionEn exists, use it
  if (language === 'en' && outfit.descriptionEn) {
    return outfit.descriptionEn
  }

  // Otherwise, fall back to French description
  return outfit.description || ''
}

/**
 * Convert Mathematical Alphanumeric Symbols (fake bold from Instagram/Notes)
 * back to regular Latin letters so we can style with real CSS.
 */
export function normalizeFakeBoldText(input) {
  if (!input || typeof input !== 'string') return ''
  let out = ''
  for (const ch of input) {
    const cp = ch.codePointAt(0)
    // Mathematical Bold A-Z / a-z
    if (cp >= 0x1d400 && cp <= 0x1d419) {
      out += String.fromCharCode(65 + (cp - 0x1d400))
      continue
    }
    if (cp >= 0x1d41a && cp <= 0x1d433) {
      out += String.fromCharCode(97 + (cp - 0x1d41a))
      continue
    }
    // Mathematical Sans-Serif Bold A-Z / a-z (common paste from phones)
    if (cp >= 0x1d5d4 && cp <= 0x1d5ed) {
      out += String.fromCharCode(65 + (cp - 0x1d5d4))
      continue
    }
    if (cp >= 0x1d5ee && cp <= 0x1d607) {
      out += String.fromCharCode(97 + (cp - 0x1d5ee))
      continue
    }
    // Mathematical Sans-Serif Bold Italic
    if (cp >= 0x1d63c && cp <= 0x1d655) {
      out += String.fromCharCode(65 + (cp - 0x1d63c))
      continue
    }
    if (cp >= 0x1d656 && cp <= 0x1d66f) {
      out += String.fromCharCode(97 + (cp - 0x1d656))
      continue
    }
    out += ch
  }
  return out.normalize('NFC')
}

/**
 * Split a look description into readable blocks for the detail page.
 * Preserves intentional newlines and pulls out short "Label :" leads.
 * @returns {{ lead: string|null, body: string }[]}
 */
export function parseOutfitDescriptionBlocks(raw) {
  const text = normalizeFakeBoldText(raw).replace(/\r\n/g, '\n').trim()
  if (!text) return []

  const parts = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return parts.map((part) => {
    // "Pourquoi ce look fonctionne : …" or "À retenir : …"
    const m = part.match(/^(.{2,72}?)\s*:\s+([\s\S]+)$/u)
    if (m) {
      const lead = m[1].trim()
      const body = m[2].trim()
      // Avoid treating mid-sentence colons as leads (e.g. time, URLs)
      const looksLikeLead =
        lead.length <= 48 &&
        !lead.includes('.') &&
        !lead.includes('http') &&
        /^[\p{L}\p{N}\s'’\-–—]+$/u.test(lead)
      if (looksLikeLead && body.length > 0) {
        return { lead, body }
      }
    }
    return { lead: null, body: part }
  })
}
