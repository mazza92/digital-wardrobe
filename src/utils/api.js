// API utility functions for the Digital Wardrobe frontend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://digital-wardrobe-admin.vercel.app/api'

export const fetchOutfits = async () => {
  try {
    const url = `${API_BASE_URL}/outfits/export?${Date.now()}`
    console.log('🔍 Fetching outfits from:', url)
    console.log('🔍 API_BASE_URL:', API_BASE_URL)
    console.log('🔍 VITE_API_URL env:', import.meta.env.VITE_API_URL)
    
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-cache'
    })
    
    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', response.headers)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API data received:', data)
      return data
    } else {
      throw new Error(`API not available: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ API fetch failed:', error.message)
    throw error
  }
}

export const fetchProfile = async () => {
  try {
    const url = `${API_BASE_URL}/profile?${Date.now()}`
    console.log('🔍 Fetching profile from:', url)
    
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-cache'
    })
    
    console.log('📡 Profile response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Profile data received:', data)
      return data
    } else {
      throw new Error(`Profile API not available: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Profile fetch failed:', error.message)
    throw error
  }
}

export const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}
