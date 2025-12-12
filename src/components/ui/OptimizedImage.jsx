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
  position: relative;
  width: 100%;
  overflow: hidden;
  background: ${props => props.$bgColor || '#f5f5f5'};
  /* Prevent layout shift with contain */
  contain: layout style paint;
  ${props => props.$aspectRatio && css`
    aspect-ratio: ${props.$aspectRatio};
  `}
`;

const Placeholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const StyledImage = styled.img.withConfig({
  shouldForwardProp: (prop) => !['$objectFit', '$objectPosition', '$loaded'].includes(prop)
})`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  object-position: ${props => props.$objectPosition || 'center'};
  opacity: ${props => props.$loaded ? 1 : 0};
  transition: opacity 0.2s ease-out;
  /* GPU acceleration and prevent layout shift */
  will-change: opacity;
  contain: layout paint;
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

  return (
    <ImageContainer
      ref={containerRef}
      className={className}
      $aspectRatio={aspectRatio}
      $bgColor={bgColor}
      {...props}
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
          width="400"
          height="533"
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
          📷
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
