import { useState, useEffect } from 'react'
import { fetchProfile, clearCacheEntry } from '../utils/api'

/**
 * CMS flag: show "Mes secrets" / myShop tab.
 * Defaults to false until profile loads (matches previous feature flag).
 */
export function useShowSecretsTab() {
  const [showSecretsTab, setShowSecretsTab] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    // Bypass stale profile cache so CMS toggles apply immediately
    clearCacheEntry('profile')
    fetchProfile(true)
      .then((profile) => {
        if (cancelled) return
        setShowSecretsTab(profile?.showSecretsTab === true)
      })
      .catch(() => {
        if (!cancelled) setShowSecretsTab(false)
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => { cancelled = true }
  }, [])

  return { showSecretsTab, loaded }
}
