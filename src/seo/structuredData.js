// Structured Data Generators
// Creates JSON-LD structured data for different content types

// Website structured data
export const generateWebsiteStructuredData = (siteData) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": siteData.name,
  "url": siteData.url,
  "description": siteData.description,
  "author": {
    "@type": "Person",
    "name": siteData.author.name,
    "url": siteData.author.url,
    "image": siteData.author.image,
    "sameAs": siteData.author.socialMedia
  },
  "publisher": {
    "@type": "Organization",
    "name": siteData.name,
    "logo": {
      "@type": "ImageObject",
      "url": siteData.logo
    }
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteData.url}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
})

// Person/Influencer structured data
export const generatePersonStructuredData = (personData) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": personData.name,
  "description": personData.bio,
  "image": personData.image,
  "url": personData.url,
  "jobTitle": personData.jobTitle || "Fashion Influencer",
  "worksFor": {
    "@type": "Organization",
    "name": personData.brand
  },
  "sameAs": personData.socialMedia,
  "knowsAbout": [
    "Fashion",
    "Style",
    "Luxury Fashion",
    "Fashion Trends",
    "Outfit Styling"
  ],
  "alumniOf": personData.education,
  "award": personData.awards,
  "hasOccupation": {
    "@type": "Occupation",
    "name": "Fashion Influencer",
    "occupationLocation": {
      "@type": "Country",
      "name": "France"
    }
  }
})

// Product structured data
export const generateProductStructuredData = (productData) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": productData.name,
  "description": productData.description,
  "image": productData.images,
  "brand": {
    "@type": "Brand",
    "name": productData.brand
  },
  "offers": {
    "@type": "Offer",
    "price": productData.price,
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "url": productData.url,
    "seller": {
      "@type": "Organization",
      "name": productData.brand
    }
  },
  "category": productData.category,
  "color": productData.color,
  "size": productData.size,
  "material": productData.material,
  "aggregateRating": productData.rating ? {
    "@type": "AggregateRating",
    "ratingValue": productData.rating.value,
    "reviewCount": productData.rating.count
  } : undefined
})

// Outfit/Collection structured data
export const generateOutfitStructuredData = (outfitData) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": outfitData.title,
  "description": outfitData.description,
  "image": outfitData.image,
  "url": outfitData.url,
  "author": {
    "@type": "Person",
    "name": outfitData.author.name,
    "url": outfitData.author.url
  },
  "dateCreated": outfitData.createdAt,
  "dateModified": outfitData.updatedAt,
  "numberOfItems": outfitData.products.length,
  "itemListElement": outfitData.products.map((product, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "Product",
      "name": product.name,
      "description": `${product.brand} - ${product.name}`,
      "image": product.image,
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": product.url
      }
    }
  }))
})

// Article/Blog Post structured data
export const generateArticleStructuredData = (articleData) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": articleData.title,
  "description": articleData.description,
  "image": articleData.image,
  "url": articleData.url,
  "datePublished": articleData.publishedAt,
  "dateModified": articleData.updatedAt,
  "author": {
    "@type": "Person",
    "name": articleData.author.name,
    "url": articleData.author.url,
    "image": articleData.author.image
  },
  "publisher": {
    "@type": "Organization",
    "name": articleData.publisher.name,
    "logo": {
      "@type": "ImageObject",
      "url": articleData.publisher.logo
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": articleData.url
  },
  "articleSection": articleData.section,
  "keywords": articleData.keywords,
  "wordCount": articleData.wordCount,
  "timeRequired": articleData.readingTime
})

// Breadcrumb structured data
export const generateBreadcrumbStructuredData = (breadcrumbs) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
})

// FAQ structured data
export const generateFAQStructuredData = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
})

// Review structured data
export const generateReviewStructuredData = (reviewData) => ({
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": reviewData.product.name,
    "brand": {
      "@type": "Brand",
      "name": reviewData.product.brand
    }
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": reviewData.rating,
    "bestRating": 5,
    "worstRating": 1
  },
  "author": {
    "@type": "Person",
    "name": reviewData.author.name
  },
  "reviewBody": reviewData.content,
  "datePublished": reviewData.publishedAt
})

// Event structured data
export const generateEventStructuredData = (eventData) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": eventData.name,
  "description": eventData.description,
  "image": eventData.image,
  "url": eventData.url,
  "startDate": eventData.startDate,
  "endDate": eventData.endDate,
  "location": {
    "@type": "Place",
    "name": eventData.location.name,
    "address": eventData.location.address
  },
  "organizer": {
    "@type": "Organization",
    "name": eventData.organizer.name,
    "url": eventData.organizer.url
  },
  "offers": {
    "@type": "Offer",
    "price": eventData.price,
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "url": eventData.ticketUrl
  }
})

// Local Business structured data
export const generateLocalBusinessStructuredData = (businessData) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": businessData.name,
  "description": businessData.description,
  "image": businessData.image,
  "url": businessData.url,
  "telephone": businessData.phone,
  "email": businessData.email,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": businessData.address.street,
    "addressLocality": businessData.address.city,
    "postalCode": businessData.address.postalCode,
    "addressCountry": businessData.address.country
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": businessData.coordinates.latitude,
    "longitude": businessData.coordinates.longitude
  },
  "openingHours": businessData.openingHours,
  "priceRange": businessData.priceRange,
  "paymentAccepted": businessData.paymentMethods,
  "currenciesAccepted": businessData.currencies
})

export default {
  generateWebsiteStructuredData,
  generatePersonStructuredData,
  generateProductStructuredData,
  generateOutfitStructuredData,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateReviewStructuredData,
  generateEventStructuredData,
  generateLocalBusinessStructuredData
}
