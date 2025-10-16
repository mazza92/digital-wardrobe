// SEO Configuration
// Centralized SEO settings and metadata for the application

export const seoConfig = {
  // Site Information
  site: {
    name: "Garde-Robe Numérique",
    url: "https://digital-wardrobe-puce.vercel.app",
    description: "Découvrez les looks élégants et sophistiqués d'Emmanuelle K. Shopping mode de luxe avec des tenues stylées et des produits sélectionnés.",
    logo: "https://digital-wardrobe-puce.vercel.app/logo.png",
    favicon: "https://digital-wardrobe-puce.vercel.app/favicon.ico",
    locale: "fr_FR",
    alternateLocales: [
      { code: "en", url: "https://digital-wardrobe-puce.vercel.app/en" },
      { code: "es", url: "https://digital-wardrobe-puce.vercel.app/es" }
    ]
  },
  
  // Author/Influencer Information
  author: {
    name: "Emmanuelle K",
    bio: "Créatrice de contenu mode et lifestyle de luxe. Partageant un style élégant et sophistiqué pour la femme moderne.",
    image: "https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg",
    url: "https://digital-wardrobe-puce.vercel.app",
    brand: "EMMANUELLE K",
    jobTitle: "Fashion Influencer & Content Creator",
    socialMedia: [
      "https://instagram.com/emmanuellek",
      "https://tiktok.com/@emmanuellek",
      "https://youtube.com/@emmanuellek",
      "https://pinterest.com/emmanuellek"
    ]
  },
  
  // Default SEO Settings
  default: {
    title: "Garde-Robe Numérique - Mode de Luxe avec Emmanuelle K",
    description: "Découvrez les looks élégants et sophistiqués d'Emmanuelle K. Shopping mode de luxe avec des tenues stylées et des produits sélectionnés.",
    keywords: [
      "mode",
      "luxe",
      "fashion",
      "style",
      "tenues",
      "shopping",
      "Emmanuelle K",
      "influenceur mode",
      "looks élégants",
      "mode féminine",
      "tendances mode",
      "shopping en ligne",
      "produits de luxe",
      "styling",
      "outfits"
    ],
    image: "https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg",
    type: "website"
  },
  
  // Page-specific SEO configurations
  pages: {
    home: {
      title: "Garde-Robe Numérique - Mode de Luxe avec Emmanuelle K",
      description: "Découvrez les looks élégants et sophistiqués d'Emmanuelle K. Shopping mode de luxe avec des tenues stylées et des produits sélectionnés.",
      keywords: [
        "mode",
        "luxe",
        "fashion",
        "style",
        "tenues",
        "shopping",
        "Emmanuelle K",
        "influenceur mode",
        "looks élégants",
        "mode féminine"
      ]
    },
    
    outfit: {
      title: "{outfitTitle} - Tenue Mode de Luxe | Garde-Robe Numérique",
      description: "Découvrez cette tenue élégante d'Emmanuelle K. {outfitDescription} Shopping des produits de cette tenue de luxe.",
      keywords: [
        "tenue",
        "outfit",
        "mode",
        "luxe",
        "shopping",
        "produits",
        "style",
        "Emmanuelle K"
      ]
    },
    
    wishlist: {
      title: "Wishlist - Produits Favoris d'Emmanuelle K | Garde-Robe Numérique",
      description: "Découvrez la wishlist d'Emmanuelle K avec ses produits favoris et sélections de mode de luxe.",
      keywords: [
        "wishlist",
        "produits favoris",
        "sélections",
        "mode",
        "luxe",
        "Emmanuelle K",
        "shopping"
      ]
    },
    
    about: {
      title: "À Propos - Emmanuelle K | Garde-Robe Numérique",
      description: "Découvrez l'univers d'Emmanuelle K, créatrice de contenu mode et lifestyle de luxe. Style élégant et sophistiqué pour la femme moderne.",
      keywords: [
        "Emmanuelle K",
        "à propos",
        "biographie",
        "influenceur mode",
        "créateur de contenu",
        "lifestyle",
        "luxe"
      ]
    }
  },
  
  // Social Media Configuration
  social: {
    twitter: {
      handle: "@emmanuellek",
      site: "@emmanuellek",
      cardType: "summary_large_image"
    },
    facebook: {
      appId: process.env.REACT_APP_FACEBOOK_APP_ID,
      pageId: process.env.REACT_APP_FACEBOOK_PAGE_ID
    },
    instagram: {
      handle: "@emmanuellek",
      url: "https://instagram.com/emmanuellek"
    },
    tiktok: {
      handle: "@emmanuellek",
      url: "https://tiktok.com/@emmanuellek"
    },
    youtube: {
      handle: "@emmanuellek",
      url: "https://youtube.com/@emmanuellek"
    },
    pinterest: {
      handle: "@emmanuellek",
      url: "https://pinterest.com/emmanuellek"
    }
  },
  
  // Analytics Configuration
  analytics: {
    googleAnalytics: process.env.REACT_APP_GA_ID,
    googleTagManager: process.env.REACT_APP_GTM_ID,
    facebookPixel: process.env.REACT_APP_FACEBOOK_PIXEL_ID
  },
  
  // Performance Configuration
  performance: {
    preload: [
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
    ],
    prefetch: [
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com"
    ]
  },
  
  // Structured Data Configuration
  structuredData: {
    organization: {
      name: "Garde-Robe Numérique",
      url: "https://digital-wardrobe-puce.vercel.app",
      logo: "https://digital-wardrobe-puce.vercel.app/logo.png",
      description: "Plateforme de mode de luxe avec Emmanuelle K",
      foundingDate: "2024",
      contactPoint: {
        contactType: "customer service",
        email: "contact@emmanuellek.com"
      }
    },
    
    person: {
      name: "Emmanuelle K",
      jobTitle: "Fashion Influencer & Content Creator",
      description: "Créatrice de contenu mode et lifestyle de luxe",
      image: "https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg",
      url: "https://digital-wardrobe-puce.vercel.app",
      sameAs: [
        "https://instagram.com/emmanuellek",
        "https://tiktok.com/@emmanuellek",
        "https://youtube.com/@emmanuellek",
        "https://pinterest.com/emmanuellek"
      ]
    }
  }
}

// Helper functions for SEO
export const generatePageTitle = (pageType, data = {}) => {
  const template = seoConfig.pages[pageType]?.title || seoConfig.default.title
  return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match)
}

export const generatePageDescription = (pageType, data = {}) => {
  const template = seoConfig.pages[pageType]?.description || seoConfig.default.description
  return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match)
}

export const generatePageKeywords = (pageType, additionalKeywords = []) => {
  const baseKeywords = seoConfig.pages[pageType]?.keywords || seoConfig.default.keywords
  return [...baseKeywords, ...additionalKeywords]
}

export const generateCanonicalUrl = (path) => {
  const baseUrl = seoConfig.site.url
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

export default seoConfig
