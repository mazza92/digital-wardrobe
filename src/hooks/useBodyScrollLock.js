import { useEffect, useRef } from 'react'

/**
 * Hook to lock body scroll when a modal/sidebar is open
 * Scrolls to top when opening to ensure sidebar is visible,
 * then restores position when closing
 *
 * @param {boolean} isOpen - Whether the modal/sidebar is open
 */
export const useBodyScrollLock = (isOpen) => {
  const scrollYRef = useRef(0)

  useEffect(() => {
    if (isOpen) {
      // Save current scroll position before locking
      scrollYRef.current = window.scrollY

      // Lock page scroll without blocking touch events inside the sidebar.
      // We use position:fixed + top offset instead of overflow:hidden so that
      // the sidebar's own scroll container keeps working on iOS Safari.
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollYRef.current}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overscrollBehavior = 'none'

      return () => {
        // Restore page scroll
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overscrollBehavior = ''

        // Restore scroll position synchronously before paint
        window.scrollTo({ top: scrollYRef.current, behavior: 'instant' })
      }
    }
  }, [isOpen])
}

export default useBodyScrollLock
