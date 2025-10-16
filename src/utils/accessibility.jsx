// Accessibility Utilities
// Comprehensive accessibility features for WCAG 2.1 AA compliance

import React, { useEffect, useRef, useState } from 'react'

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Handle arrow key navigation
  handleArrowKeys: (currentIndex, items, direction, callback) => {
    let newIndex = currentIndex
    
    if (direction === 'up' || direction === 'left') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    } else if (direction === 'down' || direction === 'right') {
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    }
    
    callback(newIndex)
  },
  
  // Handle Enter and Space key activation
  handleActivation: (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  },
  
  // Handle Escape key
  handleEscape: (event, callback) => {
    if (event.key === 'Escape') {
      callback()
    }
  },
  
  // Focus trap for modals
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }
    
    element.addEventListener('keydown', handleTabKey)
    firstElement?.focus()
    
    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }
}

// ============================================================================
// SCREEN READER SUPPORT
// ============================================================================

// Screen reader utilities
export const screenReader = {
  // Announce text to screen readers
  announce: (message, priority = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },
  
  // Create screen reader only text
  createScreenReaderText: (text) => {
    return <span className="sr-only">{text}</span>
  },
  
  // Generate accessible labels
  generateLabel: (element, context) => {
    const labels = {
      button: `Bouton ${context}`,
      link: `Lien vers ${context}`,
      image: `Image: ${context}`,
      input: `Champ ${context}`,
      select: `Sélection ${context}`,
      textarea: `Zone de texte ${context}`
    }
    
    return labels[element] || context
  }
}

// ============================================================================
// COLOR CONTRAST
// ============================================================================

// Color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },
  
  // Calculate contrast ratio
  getContrastRatio: (color1, color2) => {
    const [r1, g1, b1] = color1
    const [r2, g2, b2] = color2
    
    const lum1 = colorContrast.getLuminance(r1, g1, b1)
    const lum2 = colorContrast.getLuminance(r2, g2, b2)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  },
  
  // Check if contrast meets WCAG standards
  meetsWCAG: (color1, color2, level = 'AA') => {
    const ratio = colorContrast.getContrastRatio(color1, color2)
    const requirements = {
      AA: 4.5,
      AAA: 7
    }
    
    return ratio >= requirements[level]
  }
}

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

// Focus management utilities
export const focusManagement = {
  // Store and restore focus
  storeFocus: () => {
    const activeElement = document.activeElement
    return activeElement
  },
  
  restoreFocus: (element) => {
    if (element && typeof element.focus === 'function') {
      element.focus()
    }
  },
  
  // Focus first focusable element
  focusFirst: (container) => {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
  },
  
  // Focus last focusable element
  focusLast: (container) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const lastElement = focusable[focusable.length - 1]
    lastElement?.focus()
  }
}

// ============================================================================
// ARIA UTILITIES
// ============================================================================

// ARIA utilities
export const ariaUtils = {
  // Generate unique IDs
  generateId: (prefix = 'element') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Create ARIA attributes
  createAriaAttributes: (options = {}) => {
    const attributes = {}
    
    if (options.label) attributes['aria-label'] = options.label
    if (options.labelledBy) attributes['aria-labelledby'] = options.labelledBy
    if (options.describedBy) attributes['aria-describedby'] = options.describedBy
    if (options.expanded !== undefined) attributes['aria-expanded'] = options.expanded
    if (options.selected !== undefined) attributes['aria-selected'] = options.selected
    if (options.checked !== undefined) attributes['aria-checked'] = options.checked
    if (options.disabled !== undefined) attributes['aria-disabled'] = options.disabled
    if (options.hidden !== undefined) attributes['aria-hidden'] = options.hidden
    if (options.live) attributes['aria-live'] = options.live
    if (options.atomic) attributes['aria-atomic'] = options.atomic
    if (options.role) attributes.role = options.role
    
    return attributes
  },
  
  // Create ARIA relationships
  createAriaRelationship: (elementId, relatedIds) => {
    return {
      'aria-controls': relatedIds.join(' '),
      'aria-owns': relatedIds.join(' ')
    }
  }
}

// ============================================================================
// MOTION & ANIMATION
// ============================================================================

// Motion and animation utilities
export const motionUtils = {
  // Check for reduced motion preference
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
  
  // Apply reduced motion styles
  applyReducedMotion: (element, normalStyles, reducedStyles) => {
    if (motionUtils.prefersReducedMotion()) {
      Object.assign(element.style, reducedStyles)
    } else {
      Object.assign(element.style, normalStyles)
    }
  },
  
  // Safe animation duration
  getSafeDuration: (duration) => {
    return motionUtils.prefersReducedMotion() ? 0 : duration
  }
}

// ============================================================================
// ACCESSIBLE COMPONENTS
// ============================================================================

// Accessible button component
export const AccessibleButton = ({
  children,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  disabled = false,
  ...props
}) => {
  const handleKeyDown = (event) => {
    keyboardNavigation.handleActivation(event, onClick)
  }

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Accessible link component
export const AccessibleLink = ({
  children,
  href,
  ariaLabel,
  external = false,
  ...props
}) => {
  const linkProps = {
    href,
    'aria-label': ariaLabel,
    ...props
  }

  if (external) {
    linkProps.target = '_blank'
    linkProps.rel = 'noopener noreferrer'
    linkProps['aria-label'] = `${ariaLabel} (ouvre dans un nouvel onglet)`
  }

  return (
    <a {...linkProps}>
      {children}
      {external && screenReader.createScreenReaderText('(ouvre dans un nouvel onglet)')}
    </a>
  )
}

// Accessible image component
export const AccessibleImage = ({
  src,
  alt,
  ariaLabel,
  decorative = false,
  ...props
}) => {
  const imageProps = {
    src,
    alt: decorative ? '' : alt,
    'aria-label': ariaLabel,
    ...props
  }

  if (decorative) {
    imageProps.role = 'presentation'
    imageProps['aria-hidden'] = 'true'
  }

  return <img {...imageProps} />
}

// ============================================================================
// ACCESSIBILITY HOOKS
// ============================================================================

// Custom hook for focus management
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState(null)
  
  const storeFocus = () => {
    setFocusedElement(document.activeElement)
  }
  
  const restoreFocus = () => {
    if (focusedElement && typeof focusedElement.focus === 'function') {
      focusedElement.focus()
    }
  }
  
  return { storeFocus, restoreFocus, focusedElement }
}

// Custom hook for keyboard navigation
export const useKeyboardNavigation = (items, initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        keyboardNavigation.handleArrowKeys(currentIndex, items, 'up', setCurrentIndex)
        break
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        keyboardNavigation.handleArrowKeys(currentIndex, items, 'down', setCurrentIndex)
        break
      case 'Home':
        event.preventDefault()
        setCurrentIndex(0)
        break
      case 'End':
        event.preventDefault()
        setCurrentIndex(items.length - 1)
        break
    }
  }
  
  return { currentIndex, setCurrentIndex, handleKeyDown }
}

// Custom hook for ARIA live regions
export const useAriaLive = () => {
  const announce = (message, priority = 'polite') => {
    screenReader.announce(message, priority)
  }
  
  return { announce }
}

export default {
  keyboardNavigation,
  screenReader,
  colorContrast,
  focusManagement,
  ariaUtils,
  motionUtils,
  AccessibleButton,
  AccessibleLink,
  AccessibleImage,
  useFocusManagement,
  useKeyboardNavigation,
  useAriaLive
}
