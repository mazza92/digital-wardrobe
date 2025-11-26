import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const selectedPulse = css`
  animation: ${pulseAnimation} 0.3s ease;
`;

// Layout
const OnboardingContainer = styled.div`
  min-height: 100vh;
  background: #FAFAFA;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E5E5E5;
  background: white;
`;

const Logo = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const SkipButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

// Progress Steps
const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #E5E5E5;
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.$active ? '#1a1a1a' : props.$completed ? '#1a1a1a' : '#999'};
  font-weight: ${props => props.$active ? '600' : '400'};
  font-size: 0.9rem;
  
  &::after {
    content: '';
    display: ${props => props.$last ? 'none' : 'block'};
    width: 40px;
    height: 2px;
    background: ${props => props.$completed ? '#1a1a1a' : '#E5E5E5'};
    margin-left: 0.5rem;
  }
`;

const StepDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active || props.$completed ? '#1a1a1a' : '#ccc'};
`;

// Main Content
const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  animation: ${fadeIn} 0.5s ease;
`;

const StepTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  text-align: center;
`;

const StepSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 2.5rem 0;
  text-align: center;
`;

// Selection Grid
const SelectionGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  max-width: 800px;
  margin-bottom: 3rem;
`;

const SelectionCard = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: ${props => props.$selected ? '#1a1a1a' : 'white'};
  color: ${props => props.$selected ? 'white' : '#1a1a1a'};
  border: 2px solid ${props => props.$selected ? '#1a1a1a' : '#E5E5E5'};
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  
  &:hover {
    border-color: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  ${props => props.$selected && selectedPulse}
`;

const CardIcon = styled.span`
  font-size: 1.5rem;
`;

const CardLabel = styled.span`
  font-weight: 500;
`;

// Brand Input Section
const BrandInputSection = styled.div`
  width: 100%;
  max-width: 500px;
  margin-bottom: 2rem;
`;

const BrandInput = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #1a1a1a;
    box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const BrandTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const BrandTag = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #1a1a1a;
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const RemoveTag = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

// Suggested Brands
const SuggestedBrands = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const SuggestedBrand = styled.button`
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #E5E5E5;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9e9e9;
    color: #333;
  }
`;

// Navigation Buttons
const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const NavButton = styled.button`
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$primary ? `
    background: #1a1a1a;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background: #333;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #666;
    border: 2px solid #E5E5E5;
    
    &:hover {
      border-color: #ccc;
      color: #333;
    }
  `}
`;

// Error Message
const ErrorMessage = styled.div`
  color: #dc2626;
  background: #fef2f2;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  text-align: center;
  max-width: 500px;
`;

const suggestedBrands = [
  'Zara', 'H&M', 'Gucci', 'Prada', 'Nike', 'Adidas', 
  'Mango', 'Massimo Dutti', 'COS', 'Uniqlo', 'Sézane', 'Rouje'
];

const Onboarding = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [favoriteBrands, setFavoriteBrands] = useState([]);
  const [brandInput, setBrandInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { updateProfile, loading } = useAuth();
  const navigate = useNavigate();

  // Style options with translated labels
  const styleOptions = [
    { id: 'casual', icon: '👕' },
    { id: 'elegant', icon: '✨' },
    { id: 'bohemian', icon: '🌸' },
    { id: 'minimalist', icon: '⬜' },
    { id: 'streetwear', icon: '🔥' },
    { id: 'vintage', icon: '🕰️' },
    { id: 'sporty', icon: '🏃' },
    { id: 'romantic', icon: '💕' },
  ];

  const toggleStyle = (styleId) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(s => s !== styleId)
        : [...prev, styleId]
    );
  };

  const addBrand = (brand) => {
    const trimmedBrand = brand.trim();
    if (trimmedBrand && !favoriteBrands.includes(trimmedBrand)) {
      setFavoriteBrands(prev => [...prev, trimmedBrand]);
      setBrandInput('');
    }
  };

  const removeBrand = (brand) => {
    setFavoriteBrands(prev => prev.filter(b => b !== brand));
  };

  const handleBrandKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addBrand(brandInput);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await updateProfile({ 
        styleInterests: selectedStyles,
        favoriteBrands: favoriteBrands,
        onboardingCompleted: true
      });
      // Navigate to profile after completing onboarding
      navigate('/profile');
    } catch (err) {
      console.error('Onboarding error:', err);
      setErrorMsg(t('error.generic'));
      setTimeout(() => {
        // Still go to profile even on error - preferences saved locally
        navigate('/profile');
      }, 2000);
    }
  };

  const handleSkip = () => {
    // Skip to profile - they can update preferences later
    navigate('/profile');
  };

  const steps = [
    { id: 1, label: t('onboarding.steps.style') },
    { id: 2, label: t('onboarding.steps.brands') },
    { id: 3, label: t('onboarding.steps.finish') },
  ];

  if (loading) {
    return (
      <OnboardingContainer>
        <MainContent>
          <Logo>👗</Logo>
          <StepTitle style={{ marginTop: '1rem' }}>{t('common.loading')}</StepTitle>
        </MainContent>
      </OnboardingContainer>
    );
  }

  return (
    <OnboardingContainer>
      <Header>
        <Logo>👗</Logo>
        <SkipButton onClick={handleSkip}>{t('onboarding.skip')}</SkipButton>
      </Header>

      <ProgressContainer>
        {steps.map((step, index) => (
          <ProgressStep 
            key={step.id}
            $active={currentStep === step.id}
            $completed={currentStep > step.id}
            $last={index === steps.length - 1}
          >
            <StepDot $active={currentStep === step.id} $completed={currentStep > step.id} />
            {step.label}
          </ProgressStep>
        ))}
      </ProgressContainer>

      <MainContent key={currentStep}>
        {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

        {currentStep === 1 && (
          <>
            <StepTitle>{t('onboarding.style.title')}</StepTitle>
            <StepSubtitle>{t('onboarding.style.subtitle')}</StepSubtitle>
            
            <SelectionGrid>
              {styleOptions.map(style => (
                <SelectionCard
                  key={style.id}
                  $selected={selectedStyles.includes(style.id)}
                  onClick={() => toggleStyle(style.id)}
                  type="button"
                >
                  <CardIcon>{style.icon}</CardIcon>
                  <CardLabel>{t(`onboarding.style.options.${style.id}`)}</CardLabel>
                </SelectionCard>
              ))}
            </SelectionGrid>

            <ButtonContainer>
              <NavButton $primary onClick={handleNext}>
                {t('common.continue')}
              </NavButton>
            </ButtonContainer>
          </>
        )}

        {currentStep === 2 && (
          <>
            <StepTitle>{t('onboarding.brands.title')}</StepTitle>
            <StepSubtitle>{t('onboarding.brands.subtitle')}</StepSubtitle>
            
            <BrandInputSection>
              <BrandInput
                type="text"
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                onKeyDown={handleBrandKeyDown}
                placeholder={t('onboarding.brands.placeholder')}
              />
              
              {favoriteBrands.length > 0 && (
                <BrandTags>
                  {favoriteBrands.map(brand => (
                    <BrandTag key={brand}>
                      {brand}
                      <RemoveTag onClick={() => removeBrand(brand)}>×</RemoveTag>
                    </BrandTag>
                  ))}
                </BrandTags>
              )}
              
              <SuggestedBrands>
                {suggestedBrands
                  .filter(b => !favoriteBrands.includes(b))
                  .slice(0, 8)
                  .map(brand => (
                    <SuggestedBrand 
                      key={brand} 
                      onClick={() => addBrand(brand)}
                      type="button"
                    >
                      + {brand}
                    </SuggestedBrand>
                  ))}
              </SuggestedBrands>
            </BrandInputSection>

            <ButtonContainer>
              <NavButton onClick={handleBack}>{t('common.back')}</NavButton>
              <NavButton $primary onClick={handleNext}>
                {t('common.continue')}
              </NavButton>
            </ButtonContainer>
          </>
        )}

        {currentStep === 3 && (
          <>
            <Logo style={{ width: 80, height: 80, fontSize: '3rem', marginBottom: '1.5rem' }}>✨</Logo>
            <StepTitle>{t('onboarding.complete.title')}</StepTitle>
            <StepSubtitle>{t('onboarding.complete.subtitle')}</StepSubtitle>

            <ButtonContainer>
              <NavButton onClick={handleBack}>{t('common.back')}</NavButton>
              <NavButton $primary onClick={handleSubmit} disabled={submitting}>
                {submitting ? t('common.loading') : t('onboarding.complete.button')}
              </NavButton>
            </ButtonContainer>
          </>
        )}
      </MainContent>
    </OnboardingContainer>
  );
};

export default Onboarding;
