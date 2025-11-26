import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { Container, Card, CardBody, Heading, Input, Button, Text, Flex, Spinner } from '../../../design-system/components';
import { theme } from '../../../design-system/theme';

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #FDFCF8;
`;

const Header = styled.header`
  background: #F3F0E9;
  backdrop-filter: blur(20px);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (min-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const BackButton = styled(Link)`
  color: #666;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
  }
  
  &:hover {
    color: #101010;
    background-color: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);
  }
`;

const BrandName = styled.h1`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
  color: #101010;
  
  @media (min-width: 768px) {
    font-size: 1.25rem;
    letter-spacing: 2px;
  }
`;

const AuthContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 2rem 1rem;
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  padding: ${theme.spacing[6]};
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error[500]};
  margin-bottom: ${theme.spacing[4]};
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: ${theme.spacing[6]};
  font-size: ${theme.typography.fontSize.sm};
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.neutral[600]};
  margin-top: ${theme.spacing[2]};
`;

const PasswordHint = styled.p`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.neutral[500]};
  margin-top: ${theme.spacing[1]};
`;

// Email Confirmation Screen Styles
const ConfirmationContainer = styled.div`
  text-align: center;
  padding: 2rem 0;
`;

const EmailIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: ${pulseAnimation} 2s ease-in-out infinite;
`;

const ConfirmationTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
`;

const ConfirmationText = styled.p`
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
`;

const EmailHighlight = styled.span`
  color: #1a1a1a;
  font-weight: 600;
`;

const StepsList = styled.div`
  text-align: left;
  background: #f8f6f3;
  border-radius: 12px;
  padding: 1.25rem;
  margin: 1.5rem 0;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    margin-bottom: 0.5rem;
  }
`;

const StepNumber = styled.span`
  width: 24px;
  height: 24px;
  background: #1a1a1a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const StepText = styled.span`
  color: #555;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.5rem;
  margin-top: 1rem;
  
  &:hover {
    color: #1a1a1a;
  }
  
  &:disabled {
    color: #aaa;
    cursor: not-allowed;
  }
`;

const SignUp = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { signup, loading, error, isAuthenticated, needsOnboarding } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await signup(email, password, marketingOptIn);
      // Always show email confirmation screen after signup
      // The user will be redirected to onboarding after confirming email
      if (user) {
        setRegisteredEmail(email);
        setShowConfirmation(true);
      }
    } catch (err) {
      // Error is handled by context and displayed via the error state
      console.error('Signup error:', err);
    }
  };

  // If authenticated and needs onboarding, redirect to onboarding
  // This happens when user confirms their email and returns to the app
  // Don't redirect if we're showing the confirmation screen (user just signed up)
  useEffect(() => {
    // Skip redirect if showing confirmation screen - user just signed up
    if (showConfirmation) {
      return;
    }
    
    if (isAuthenticated && needsOnboarding) {
      navigate('/onboarding');
    } else if (isAuthenticated && !needsOnboarding) {
      // Already completed onboarding, go to profile
      navigate('/profile');
    }
  }, [isAuthenticated, needsOnboarding, navigate, showConfirmation]);

  return (
    <PageWrapper>
      <Header>
        <BackButton to="/">
          ← {t('common.back')}
        </BackButton>
        <BrandName>Virtual Dressing</BrandName>
        <div style={{ width: '100px' }} /> {/* Spacer for centering */}
      </Header>
      
      <AuthContainer>
        <AuthCard>
          <CardBody>
            {showConfirmation ? (
              <ConfirmationContainer>
                <EmailIcon>📧</EmailIcon>
                <ConfirmationTitle>{t('auth.signup.confirmEmail.title')}</ConfirmationTitle>
                <ConfirmationText>
                  {t('auth.signup.confirmEmail.sentTo')}{' '}
                  <EmailHighlight>{registeredEmail}</EmailHighlight>
                </ConfirmationText>
                
                <StepsList>
                  <StepItem>
                    <StepNumber>1</StepNumber>
                    <StepText>{t('auth.signup.confirmEmail.step1')}</StepText>
                  </StepItem>
                  <StepItem>
                    <StepNumber>2</StepNumber>
                    <StepText>{t('auth.signup.confirmEmail.step2')}</StepText>
                  </StepItem>
                  <StepItem>
                    <StepNumber>3</StepNumber>
                    <StepText>{t('auth.signup.confirmEmail.step3')}</StepText>
                  </StepItem>
                </StepsList>
                
                <ConfirmationText style={{ fontSize: '0.85rem', color: '#888' }}>
                  {t('auth.signup.confirmEmail.checkSpam')}
                </ConfirmationText>
                
                <ResendButton onClick={() => setShowConfirmation(false)}>
                  {t('auth.signup.confirmEmail.wrongEmail')}
                </ResendButton>
              </ConfirmationContainer>
            ) : (
              <>
                <Heading size="2xl" style={{ textAlign: 'center', marginBottom: theme.spacing[2] }}>
                  {t('auth.signup.title')}
                </Heading>
                <Subtitle>{t('auth.signup.subtitle')}</Subtitle>
                
                {error && <ErrorMessage>{error}</ErrorMessage>}
                
                <form onSubmit={handleSubmit}>
                  <Flex direction="column" gap={4}>
                    <div>
                      <Text size="sm" weight="medium" style={{ marginBottom: theme.spacing[2] }}>
                        {t('auth.signup.email')}
                      </Text>
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder={t('auth.signup.emailPlaceholder')}
                        required 
                        autoComplete="email"
                      />
                    </div>
                    
                    <div>
                      <Text size="sm" weight="medium" style={{ marginBottom: theme.spacing[2] }}>
                        {t('auth.signup.password')}
                      </Text>
                      <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder={t('auth.signup.passwordPlaceholder')}
                        required 
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <PasswordHint>{t('auth.signup.passwordHint')}</PasswordHint>
                    </div>

                    <CheckboxContainer>
                      <input 
                        type="checkbox" 
                        checked={marketingOptIn} 
                        onChange={(e) => setMarketingOptIn(e.target.checked)} 
                      />
                      {t('auth.signup.marketing')}
                    </CheckboxContainer>

                    <Button type="submit" disabled={loading} style={{ marginTop: theme.spacing[2] }}>
                      {loading ? <Spinner size="20px" color="white" /> : t('auth.signup.submit')}
                    </Button>
                  </Flex>
                </form>

                <Text size="sm" style={{ textAlign: 'center', marginTop: theme.spacing[6] }}>
                  {t('auth.signup.hasAccount')}{' '}
                  <Link to="/login" style={{ color: theme.colors.primary[600], fontWeight: 'bold' }}>
                    {t('auth.signup.loginLink')}
                  </Link>
                </Text>
              </>
            )}
          </CardBody>
        </AuthCard>
      </AuthContainer>
    </PageWrapper>
  );
};

export default SignUp;
