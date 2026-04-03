// Custom SEO Hook for React 19
// Simple SEO management without external dependencies

import { useEffect } from 'react'
import { getOutfitDescription, getOutfitTitle } from '../utils/outfitUtils'
import { outfitToSlug } from '../utils/slugify'

export const useSEO = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  author = 'Emmanuelle K',
  siteName = 'Emmanuelle K'
}) => {
  useEffect(() => {
    // Update document title
    const fullTitle = title ? `${title} | ${siteName}` : 'Emmanuelle K - CuratedCloset'
    document.title = fullTitle

    // Update or create meta tags
    const updateMetaTag = (name, content, property = false) => {
      const attribute = property ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attribute}="${name}"]`)
      
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Update basic meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords.join(', '))
    updateMetaTag('author', author)

    // Update Open Graph tags
    updateMetaTag('og:title', fullTitle, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:type', type, true)
    updateMetaTag('og:url', url, true)
    updateMetaTag('og:site_name', siteName, true)
    
    if (image) {
      updateMetaTag('og:image', image, true)
      updateMetaTag('og:image:width', '1200', true)
      updateMetaTag('og:image:height', '630', true)
      updateMetaTag('og:image:alt', title, true)
    }

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', fullTitle)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:site', '@emmanuellek')
    updateMetaTag('twitter:creator', '@emmanuellek')
    
    if (image) {
      updateMetaTag('twitter:image', image)
      updateMetaTag('twitter:image:alt', title)
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

  }, [title, description, keywords, image, url, type, author, siteName])
}

// Production domain - always use this for SEO, not Vercel preview URLs
const PRODUCTION_DOMAIN = 'https://emmanuellek.com'

// SEO configuration for different pages
export const seoConfig = {
  home: {
    title: 'CuratedCloset',
    description: 'Découvrez les looks élégants et sophistiqués d\'Emmanuelle K. Shopping mode de luxe avec des tenues stylées et des produits sélectionnés.',
    keywords: [
      'mode', 'luxe', 'fashion', 'style', 'tenues', 'shopping',
      'Emmanuelle K', 'influenceur mode', 'looks élégants',
      'mode féminine', 'tendances mode', 'shopping en ligne'
    ],
    image: `${PRODUCTION_DOMAIN}/favicon.png`,
    url: PRODUCTION_DOMAIN
  },

  outfit: (outfitData, language = 'fr') => {
    const title = getOutfitTitle(outfitData, language)
    const description = getOutfitDescription(outfitData, language)
    return {
      title: `${title} - Tenue Mode de Luxe`,
      description: `Découvrez cette tenue élégante d'Emmanuelle K. ${description} Shopping des produits de cette tenue de luxe.`,
      keywords: [
        'tenue', 'outfit', 'mode', 'luxe', 'shopping', 'produits',
        'style', 'Emmanuelle K', title
      ],
      image: outfitData.image,
      url: `${PRODUCTION_DOMAIN}/outfits/${outfitToSlug(outfitData)}`
    }
  },

  wishlist: {
    title: 'Wishlist - Produits Favoris d\'Emmanuelle K',
    description: 'Découvrez la wishlist d\'Emmanuelle K avec ses produits favoris et sélections de mode de luxe.',
    keywords: [
      'wishlist', 'produits favoris', 'sélections', 'mode', 'luxe',
      'Emmanuelle K', 'shopping'
    ],
    image: `${PRODUCTION_DOMAIN}/favicon.png`,
    url: PRODUCTION_DOMAIN
  },

  about: {
    title: 'À Propos - Emmanuelle K',
    description: 'Découvrez l\'univers d\'Emmanuelle K, créatrice de contenu mode et lifestyle de luxe. Style élégant et sophistiqué pour la femme moderne.',
    keywords: [
      'Emmanuelle K', 'à propos', 'biographie', 'influenceur mode',
      'créateur de contenu', 'lifestyle', 'luxe'
    ],
    image: `${PRODUCTION_DOMAIN}/favicon.png`,
    url: `${PRODUCTION_DOMAIN}/about`
  }
}

export default useSEO
