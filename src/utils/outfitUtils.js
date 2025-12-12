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

