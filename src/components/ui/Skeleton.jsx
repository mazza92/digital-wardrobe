import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${props => props.$rounded ? '50%' : props.$radius || '8px'};
`;

// Basic skeleton shapes
export const SkeletonRect = styled(SkeletonBase)`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '20px'};
`;

export const SkeletonCircle = styled(SkeletonBase)`
  width: ${props => props.$size || '40px'};
  height: ${props => props.$size || '40px'};
  border-radius: 50%;
`;

export const SkeletonText = styled(SkeletonBase)`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '14px'};
  border-radius: 4px;
`;

// Outfit Card Skeleton
const OutfitCardSkeleton = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
`;

const OutfitImageSkeleton = styled(SkeletonBase)`
  width: 100%;
  padding-top: 125%;
  border-radius: 0;
`;

const OutfitInfoSkeleton = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const OutfitSkeleton = () => (
  <OutfitCardSkeleton>
    <OutfitImageSkeleton />
    <OutfitInfoSkeleton>
      <SkeletonText $width="60%" $height="12px" />
      <SkeletonText $width="80%" $height="16px" />
      <SkeletonText $width="40%" $height="14px" />
    </OutfitInfoSkeleton>
  </OutfitCardSkeleton>
);

// Grid of Outfit Skeletons
const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const OutfitsGridSkeleton = ({ count = 8 }) => (
  <SkeletonGrid>
    {Array.from({ length: count }).map((_, i) => (
      <OutfitSkeleton key={i} />
    ))}
  </SkeletonGrid>
);

// Hero Section Skeleton
const HeroSkeletonWrapper = styled.div`
  background: #E3DBCC;
  padding: 3rem 2rem;
  text-align: center;
`;

const HeroAvatarSkeleton = styled(SkeletonBase)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
`;

export const HeroSkeleton = () => (
  <HeroSkeletonWrapper>
    <HeroAvatarSkeleton />
    <SkeletonText $width="200px" $height="24px" style={{ margin: '0 auto 0.75rem' }} />
    <SkeletonText $width="150px" $height="16px" style={{ margin: '0 auto 1rem' }} />
    <SkeletonText $width="300px" $height="14px" style={{ margin: '0 auto' }} />
  </HeroSkeletonWrapper>
);

// Product Card Skeleton
const ProductCardSkeleton = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const ProductImageSkeleton = styled(SkeletonBase)`
  width: 100%;
  padding-top: 100%;
  border-radius: 0;
`;

const ProductInfoSkeleton = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const ProductSkeleton = () => (
  <ProductCardSkeleton>
    <ProductImageSkeleton />
    <ProductInfoSkeleton>
      <SkeletonText $width="50%" $height="10px" />
      <SkeletonText $width="70%" $height="12px" />
      <SkeletonText $width="40%" $height="14px" />
    </ProductInfoSkeleton>
  </ProductCardSkeleton>
);

// Stats Skeleton
const StatsSkeletonWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const StatSkeleton = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
`;

export const StatsSkeleton = () => (
  <StatsSkeletonWrapper>
    {[1, 2, 3].map(i => (
      <StatSkeleton key={i}>
        <SkeletonText $width="50px" $height="28px" style={{ margin: '0 auto 0.5rem' }} />
        <SkeletonText $width="60px" $height="12px" style={{ margin: '0 auto' }} />
      </StatSkeleton>
    ))}
  </StatsSkeletonWrapper>
);

// Full Page Loading Skeleton – matches current MainPortal layout (white header, hero, tabs, grid)
const PageSkeletonWrapper = styled.div`
  min-height: 100vh;
  background: #ffffff;
  color: #101010;
`;

const HeaderSkeleton = styled.div`
  background: #ffffff;
  padding: 0.875rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  min-height: 56px;
  @media (min-width: 768px) {
    padding: 1.125rem 2rem;
    min-height: 64px;
  }
`;

const HeaderRightSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @media (min-width: 768px) {
    gap: 0.75rem;
  }
`;

const PageHeroSkeletonWrapper = styled.div`
  background: #ffffff;
  padding: 2rem 1rem;
  text-align: center;
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const HeroBannerSkeleton = styled(SkeletonBase)`
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 0;
  margin-bottom: 1.5rem;
  @media (min-width: 768px) {
    aspect-ratio: 21/9;
    margin-bottom: 2rem;
  }
`;

const HeroTextContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const PageHeroSkeleton = () => (
  <PageHeroSkeletonWrapper>
    <SkeletonText $width="180px" $height="12px" style={{ margin: '0 auto 1rem' }} />
    <HeroBannerSkeleton />
    <HeroTextContainer>
      <SkeletonText $width="200px" $height="28px" />
      <SkeletonText $width="280px" $height="16px" />
    </HeroTextContainer>
  </PageHeroSkeletonWrapper>
);

const TabBarSkeleton = styled.div`
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0 0.75rem;
  display: flex;
  gap: 0.5rem;
  min-height: 48px;
  align-items: center;
  @media (min-width: 768px) {
    padding: 0 2rem;
  }
`;

const TabPillSkeleton = styled(SkeletonBase)`
  width: 80px;
  height: 36px;
  border-radius: 20px;
  flex-shrink: 0;
  @media (min-width: 480px) {
    width: 100px;
  }
`;

const PageContentSkeleton = styled.div`
  padding: 4rem 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  @media (min-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const PageSectionTitleSkeleton = styled.div`
  margin-bottom: 2.5rem;
`;

const PageOutfitGridSkeleton = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }
`;

const PageOutfitCardSkeleton = styled.div`
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const PageOutfitImageSkeleton = styled(SkeletonBase)`
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 0;
`;

const PageOutfitInfoSkeleton = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const PageSkeleton = () => (
  <PageSkeletonWrapper>
    <HeaderSkeleton>
      <SkeletonText $width="120px" $height="20px" />
      <HeaderRightSkeleton>
        <SkeletonText $width="72px" $height="32px" $radius="4px" />
        <SkeletonText $width="40px" $height="40px" $radius="10px" />
        <SkeletonText $width="40px" $height="40px" $radius="10px" />
      </HeaderRightSkeleton>
    </HeaderSkeleton>
    <PageHeroSkeleton />
    <TabBarSkeleton>
      {[1, 2, 3, 4].map((i) => (
        <TabPillSkeleton key={i} />
      ))}
    </TabBarSkeleton>
    <PageContentSkeleton>
      <PageSectionTitleSkeleton>
        <SkeletonText $width="140px" $height="24px" />
      </PageSectionTitleSkeleton>
      <PageOutfitGridSkeleton>
        {[...Array(6)].map((_, i) => (
          <PageOutfitCardSkeleton key={i}>
            <PageOutfitImageSkeleton />
            <PageOutfitInfoSkeleton>
              <SkeletonText $width="85%" $height="14px" />
              <SkeletonText $width="60%" $height="12px" />
            </PageOutfitInfoSkeleton>
          </PageOutfitCardSkeleton>
        ))}
      </PageOutfitGridSkeleton>
    </PageContentSkeleton>
  </PageSkeletonWrapper>
);

export default {
  SkeletonRect,
  SkeletonCircle,
  SkeletonText,
  OutfitSkeleton,
  OutfitsGridSkeleton,
  HeroSkeleton,
  ProductSkeleton,
  StatsSkeleton,
  PageSkeleton
};

