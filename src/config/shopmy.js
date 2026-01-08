// ShopMy Auto-Linking Configuration
// Get your script code from: Account Settings → Advanced → Auto-Linking Script
// Replace 'YOUR_SHOPMY_ID' with your actual ShopMy script ID

export const SHOPMY_CONFIG = {
  // ShopMy script ID (e.g., 'sDXyBS' from the script URL)
  // Format: https://static.shopmy.us/Auto/YOUR_ID.js
  scriptId: process.env.VITE_SHOPMY_SCRIPT_ID || 'YOUR_SHOPMY_ID',
  
  // Enable/disable ShopMy auto-linking
  enabled: process.env.VITE_SHOPMY_ENABLED !== 'false',
  
  // Domains to skip (already handled by our affiliate system)
  skipDomains: [
    'go.shopmy.us', // ShopMy links themselves
    'feeds.affilae.com', // Affilae affiliate links
    'affilae.com', // Affilae domain
  ]
}

// Generate ShopMy script URL
export const getShopMyScriptUrl = () => {
  if (!SHOPMY_CONFIG.enabled || SHOPMY_CONFIG.scriptId === 'YOUR_SHOPMY_ID') {
    return null
  }
  return `https://static.shopmy.us/Auto/${SHOPMY_CONFIG.scriptId}.js`
}
