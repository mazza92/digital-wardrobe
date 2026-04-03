import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SignupPrompt from './SignupPrompt'

export default function GlobalSignupPromptLauncher() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [redirectPath, setRedirectPath] = useState(null)

  useEffect(() => {
    const onOpen = (event) => {
      const fallback = `${location.pathname}${location.search}${location.hash}`
      setRedirectPath(event?.detail?.redirect || fallback)
      setIsOpen(true)
    }
    window.addEventListener('dw-open-signup-prompt', onOpen)
    return () => window.removeEventListener('dw-open-signup-prompt', onOpen)
  }, [location.pathname, location.search, location.hash])

  return (
    <SignupPrompt
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      redirectAfterLogin={redirectPath}
    />
  )
}
