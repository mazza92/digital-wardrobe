import React, { useState, useRef, useEffect, memo } from 'react';
import styled, { keyframes, css } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ImageContainer = styled.div`
  position: ${props => props.$fill ? 'absolute' : 'relative'};
  ${props => props.$fill ? css`
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  ` : css`
    width: 100%;
  `}
  overflow: hidden;
  background: ${props => props.$bgColor || '#f5f5f5'};
  /* Prevent layout shift with contain */
  contain: layout style paint;
  ${props => !props.$fill && props.$aspectRatio && css`
    aspect-ratio: ${props.$aspectRatio};
  `}
`;

const Placeholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.2s ease-in-out infinite;
  z-index: 1;
`;

const StyledImage = styled.img.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$')
})`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  object-position: ${props => props.$objectPosition || 'center'};
  opacity: ${props => props.$loaded ? 1 : 0};
  transition: opacity 0.3s ease-out;
  z-index: 2;
  /* GPU acceleration */
  will-change: opacity;
`;

const BlurredPreview = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px);
  transform: scale(1.1);
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
`;

/**
 * OptimizedImage - A performance-optimized image component
 * Features:
 * - Lazy loading with Intersection Observer
 * - Placeholder shimmer while loading
 * - Smooth fade-in animation on load
 * - Optional blur-up effect with low-quality preview
 * - Responsive srcset support
 * - Error handling with fallback
 */
const OptimizedImage = memo(({
  src,
  alt,
  className,
  aspectRatio = '3/4',
  objectFit = 'cover',
  objectPosition = 'center',
  placeholder,
  lowQualitySrc,
  srcSet,
  sizes,
  loading = 'lazy',
  fetchPriority,
  onLoad,
  onError,
  bgColor,
  fill = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [loading]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  // Filter out non-DOM props to prevent React warnings
  const { isEager, ...domProps } = props;
  
  return (
    <ImageContainer
      ref={containerRef}
      className={className}
      $aspectRatio={aspectRatio}
      $bgColor={bgColor}
      $fill={fill}
      {...domProps}
    >
      {/* Shimmer placeholder */}
      {!isLoaded && !hasError && <Placeholder />}
      
      {/* Low quality preview for blur-up effect */}
      {lowQualitySrc && isInView && (
        <BlurredPreview
          src={lowQualitySrc}
          alt=""
          $visible={!isLoaded && !hasError}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      {isInView && !hasError && (
        <StyledImage
          src={src}
          alt={alt}
          srcSet={srcSet}
          sizes={sizes}
          $loaded={isLoaded}
          $objectFit={objectFit}
          $objectPosition={objectPosition}
          onLoad={handleLoad}
          onError={handleError}
          fetchPriority={fetchPriority}
          decoding="async"
          loading={loading}
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#999',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </div>
      )}
    </ImageContainer>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

// Utility to generate responsive srcset
export const generateSrcSet = (baseUrl, widths = [320, 640, 960, 1280]) => {
  // Only works with CDN URLs that support width parameters
  if (!baseUrl || !baseUrl.includes('cdn-cgi/image')) return null;
  
  return widths
    .map(w => `${baseUrl.replace(/width=\d+/, `width=${w}`)} ${w}w`)
    .join(', ');
};

// Hook for preloading critical images
export const usePreloadImages = (imageUrls) => {
  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return;

    const links = imageUrls.map(url => {
      if (!url) return null;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
      return link;
    }).filter(Boolean);

    return () => {
      links.forEach(link => {
        if (link && link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [imageUrls]);
};
