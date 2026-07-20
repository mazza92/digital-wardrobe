import { useState, useEffect, Suspense, lazy } from 'react'
import { useParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../hooks/useFavorites'
import OptimizedImage from '../ui/OptimizedImage'
import CartButton from '../shop/CartButton'
import SubtleShareButton from '../ui/SubtleShareButton'
import { postToSlug } from '../../utils/slugify'
import { LazyCartButton, LazyFavoritesList, LoadingFallback } from '../../utils/performance'
import { handleEditorialAffiliateClick } from '../../utils/tracking'

const LoginModal = lazy(() => import('../ui/LoginModal'))

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api'

const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  color: #101010;
`

const Header = styled.header`
  background: #fdfcf8;
  padding: 0.875rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 56px;
  
  @media (min-width: 480px) {
    padding: 1rem 1.25rem;
  }
  
  @media (min-width: 768px) {
    padding: 1.125rem 2rem;
    min-height: 64px;
  }
`

const BrandName = styled(Link)`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.3px;
  color: #101010;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  
  @media (min-width: 480px) {
    font-size: 1.05rem;
  }
  
  @media (min-width: 768px) {
    font-size: 1.2rem;
    letter-spacing: 0.5px;
  }
  
  &:hover {
    opacity: 0.7;
  }
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  padding-right: 0.25rem;
  
  @media (min-width: 480px) {
    gap: 0.375rem;
    padding-right: 0.5rem;
  }
  
  @media (min-width: 768px) {
    gap: 0.75rem;
    padding-right: 0;
  }
  
  @media (min-width: 1024px) {
    gap: 1rem;
  }
`

const NavLink = styled(Link)`
  color: #101010;
  text-decoration: none;
  font-weight: 400;
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
  transition: opacity 0.2s ease;
  white-space: nowrap;
  
  @media (min-width: 480px) {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
    padding: 0.5rem 1.25rem;
  }
  
  &:hover {
    opacity: 0.6;
  }
`

const NavButton = styled.button`
  color: #101010;
  background: none;
  font-weight: 400;
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
  transition: opacity 0.2s ease;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  
  @media (min-width: 480px) {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
    padding: 0.5rem 1.25rem;
  }
  
  &:hover {
    opacity: 0.6;
  }
`

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  
  &:hover {
    color: #101010;
  }
`

const HeroSection = styled.section`
  margin-bottom: 4rem;
`

const HeroImage = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 2rem;
  background: #f5f5f5;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 400;
  margin: 0 0 1rem 0;
  color: #101010;
  line-height: 1.2;
  
  @media (max-width: 767px) {
    font-size: 2rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  font-weight: 300;

  @media (max-width: 767px) {
    font-size: 1.1rem;
  }
`

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  color: #999;
  font-size: 0.9rem;
`

const PostDate = styled.span`
  &::after {
    content: '•';
    margin-left: 1rem;
    color: #ccc;
  }
`

const Content = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 4rem;
  white-space: pre-line;

  @media (max-width: 767px) {
    font-size: 1rem;
  }

  p {
    margin: 0 0 1.5rem 0;
  }
`

const ProductsSection = styled.section`
  margin-top: 4rem;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0 0 2rem 0;
  color: #101010;
  letter-spacing: 0.5px;
`

const ProductsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
  }
`

const ProductCard = styled.a`
  position: relative;
  background: white;
  border-radius: 0;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  contain: layout style;
  cursor: pointer;
  
  @media (min-width: 768px) {
    transition: opacity 0.2s ease;
    will-change: opacity;
    
    &:hover {
      opacity: 0.8;
    }
  }
`

const ProductImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  position: relative;
  overflow: hidden;
  contain: layout style paint;
  background: #f5f5f5;
`

const ProductInfo = styled.div`
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const ProductName = styled.h3`
  font-size: 0.9rem;
  font-weight: 400;
  margin: 0;
  color: #101010;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
  }
`

const ProductPrice = styled.div`
  font-size: 0.95rem;
  font-weight: 400;
  color: #101010;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1.5rem;
`

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #101010;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

export default function EditorialDetail() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { getFavoritesCount } = useFavorites()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        // Fetch posts and find by slug, ID, or slugified title
        const response = await fetch(`${API_BASE_URL}/editorial/public`)
        if (response.ok) {
          const data = await response.json()
          const foundPost = data.posts.find(p =>
            p.slug === slug ||
            p.id === slug ||
            postToSlug(p) === slug
          )
          if (foundPost) {
            setPost(foundPost)
          } else {
            setError('Article not found')
          }
        } else {
          setError('Failed to load article')
        }
      } catch (err) {
        console.error('Error fetching editorial post:', err)
        setError('Failed to load article')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug])

  if (isLoading) {
    return (
      <Container>
        <Header>
          <BrandName to="/">Emmanuelle K</BrandName>
          <HeaderRight>
            {isAuthenticated ? (
              <NavLink to="/profile">
                {t('nav.account') || 'My Account'}
              </NavLink>
            ) : (
              <NavButton onClick={() => setIsLoginModalOpen(true)}>
                {t('nav.login') || 'Login'}
              </NavButton>
            )}
            {/* Favorites - commented out for now
            <Suspense fallback={<div style={{width: '40px', height: '40px'}} />}>
              <LazyCartButton 
                onClick={() => setIsFavoritesOpen(true)} 
                favoritesCount={getFavoritesCount()} 
              />
            </Suspense>
            */}
            <CartButton />
          </HeaderRight>
        </Header>
        <LoadingContainer>
          <LoadingSpinner />
          <p>{t('common.loading', 'Chargement...')}</p>
        </LoadingContainer>
      </Container>
    )
  }

  if (error || !post) {
    return (
      <Container>
        <Header>
          <BrandName to="/">Emmanuelle K</BrandName>
          <HeaderRight>
            {isAuthenticated ? (
              <NavLink to="/profile">
                {t('nav.account') || 'My Account'}
              </NavLink>
            ) : (
              <NavButton onClick={() => setIsLoginModalOpen(true)}>
                {t('nav.login') || 'Login'}
              </NavButton>
            )}
            {/* Favorites - commented out for now
            <Suspense fallback={<div style={{width: '40px', height: '40px'}} />}>
              <LazyCartButton 
                onClick={() => setIsFavoritesOpen(true)} 
                favoritesCount={getFavoritesCount()} 
              />
            </Suspense>
            */}
            <CartButton />
          </HeaderRight>
        </Header>
        <Main>
          <p>{error || 'Article not found'}</p>
          <BackLink to="/">← {t('common.backToHome')}</BackLink>
        </Main>
      </Container>
    )
  }

  const title = i18n.language === 'en' && post.titleEn ? post.titleEn : post.title
  const subtitle = i18n.language === 'en' && post.subtitleEn ? post.subtitleEn : post.subtitle
  const content = i18n.language === 'en' && post.contentEn ? post.contentEn : post.content

  return (
    <Container>
      <Header>
        <BrandName to="/">Emmanuelle K</BrandName>
        <HeaderRight>
          {isAuthenticated ? (
            <NavLink to="/profile">
              {t('nav.account') || 'My Account'}
            </NavLink>
          ) : (
            <NavButton onClick={() => setIsLoginModalOpen(true)}>
              {t('nav.login') || 'Login'}
            </NavButton>
          )}
          {/* Favorites - commented out for now
          <Suspense fallback={<div style={{width: '40px', height: '40px'}} />}>
            <LazyCartButton 
              onClick={() => setIsFavoritesOpen(true)} 
              favoritesCount={getFavoritesCount()} 
            />
          </Suspense>
          */}
          <CartButton />
        </HeaderRight>
      </Header>

      <Main>
        <BackLink to="/">← {t('common.backToHome')}</BackLink>

        <HeroSection>
          <HeroImage>
            <OptimizedImage
              src={post.featuredImage}
              alt={title}
              aspectRatio="16/9"
              loading="eager"
              fetchPriority="high"
            />
          </HeroImage>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
          <MetaRow>
            <PostDate>
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : ''}
            </PostDate>
            <SubtleShareButton post={post} />
          </MetaRow>
          {content && (
            <Content
              dangerouslySetInnerHTML={{ __html: content }}
              onClick={(e) => {
                const anchor = e.target.closest?.('a')
                if (!anchor?.href || !post?.id) return
                handleEditorialAffiliateClick(
                  {
                    affiliateLink: anchor.href,
                    name: anchor.textContent?.trim()?.slice(0, 120) || null
                  },
                  post.id,
                  e,
                  'content'
                )
              }}
            />
          )}
        </HeroSection>

        {post.curatedProducts && post.curatedProducts.length > 0 && (
          <ProductsSection>
            <SectionTitle>{t('editorial.shopTheEdit', 'In this edit:')}</SectionTitle>
            <ProductsGrid>
              {post.curatedProducts.map((product, index) => (
                <ProductCard 
                  key={product.id || index}
                  href={product.affiliateLink ? product.affiliateLink.replace(/&amp;/g, '&') : '#'}
                  target={product.affiliateLink ? '_blank' : undefined}
                  rel={product.affiliateLink ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    if (!product.affiliateLink) {
                      e.preventDefault()
                      return
                    }
                    handleEditorialAffiliateClick(product, post.id, e, 'card')
                  }}
                >
                  <ProductImageWrapper>
                    {product.imageUrl && (
                      <OptimizedImage
                        src={product.imageUrl}
                        alt={product.name}
                        aspectRatio="3/4"
                        loading={index < 4 ? 'eager' : 'lazy'}
                      />
                    )}
                  </ProductImageWrapper>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductName style={{ fontSize: '0.85rem', color: '#666' }}>
                      {product.brand}
                    </ProductName>
                    {product.price && (
                      <ProductPrice>{product.price}</ProductPrice>
                    )}
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>
          </ProductsSection>
        )}
      </Main>
      
      {/* Favorites sidebar - commented out for now
      <Suspense fallback={<LoadingFallback message={t('loading.favorites')} />}>
        <LazyFavoritesList
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          favorites={[]}
          onRemoveFavorite={() => {}}
          onClearFavorites={() => {}}
        />
      </Suspense>
      */}

      {isLoginModalOpen && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
          />
        </Suspense>
      )}
    </Container>
  )
}
