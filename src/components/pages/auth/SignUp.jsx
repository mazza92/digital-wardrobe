import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { createPortal } from 'react-dom';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { getSafeRedirectPath, POST_LOGIN_REDIRECT_KEY } from '../../../utils/authRedirect';
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
`;

const BackButton = styled(Link)`
  color: #666;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.5rem;
  
  @media (min-width: 480px) {
    font-size: 0.9rem;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    margin-right: 1rem;
  }
  
  @media (min-width: 768px) {
    font-size: 1rem;
    border-radius: 12px;
  }
  
  &:hover {
    color: #101010;
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateX(-2px);
  }
`;

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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 1rem;
  overflow: auto;
`;
const ModalCloseBtn = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  &:hover { background: #f0f0f0; color: #333; }
`;

const SignUp = ({ asModal = false, onClose, fromInvitationFlow = false }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInvitationSuccess, setShowInvitationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { signup, loading, error, isAuthenticated, needsOnboarding, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scrollYRef = useRef(0);

  const postAuthRedirectPath = () => {
    const fromQuery = getSafeRedirectPath(searchParams.get('redirect'));
    let fromStorage = null;
    try {
      fromStorage = getSafeRedirectPath(sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY));
    } catch { /* ignore */ }
    return fromQuery || fromStorage || null;
  };

  const isAlreadyRegisteredError = error && (
    /already registered|already exists|déjà utilisé|already in use|email.*exist/i.test(error)
  );
  const displayError = isAlreadyRegisteredError ? t('auth.signup.alreadyRegisteredMessage') : error;

  // Redirect to login when email already registered (after showing the short message)
  useEffect(() => {
    if (!isAlreadyRegisteredError) return;
    const timer = setTimeout(() => {
      clearError(); // don't show "already registered" on login page
      if (asModal && onClose) onClose();
      const r = postAuthRedirectPath();
      navigate(r ? `/login?redirect=${encodeURIComponent(r)}` : '/login');
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAlreadyRegisteredError, asModal, onClose, navigate, clearError, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await signup(name, email, password, marketingOptIn);
      // Email verification step commented out for launch - client wants simple flow for testing.
      // When re-enabling: uncomment below to show "check your email" screen after signup.
      // if (user) {
      //   setRegisteredEmail(email);
      //   setShowConfirmation(true);
      // }
      // With verification disabled, user session is set by AuthContext and useEffect below redirects to profile.
    } catch (err) {
      // Error is handled by context and displayed via the error state
      console.error('Signup error:', err);
    }
  };

  // When authenticated: show invitation success screen (invitation flow) or redirect
  useEffect(() => {
    if (showConfirmation) return;
    if (!isAuthenticated) return;

    if (fromInvitationFlow && asModal) {
      setShowInvitationSuccess(true);
      return;
    }
    if (asModal && onClose) onClose();
    const dest = postAuthRedirectPath();
    try {
      sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    } catch { /* ignore */ }
    navigate(dest || '/profile');
  }, [isAuthenticated, navigate, showConfirmation, asModal, onClose, fromInvitationFlow, searchParams]);

  useEffect(() => {
    if (!asModal || !onClose) return;
    scrollYRef.current = window.scrollY || 0;
    const body = document.body;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = 'fixed';
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [asModal, onClose]);

  const invitationSuccessContent = (
    <ConfirmationContainer>
      <EmailIcon style={{ color: '#16a34a' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </EmailIcon>
      <ConfirmationTitle>{t('auth.signup.invitationSuccessTitle')}</ConfirmationTitle>
      <ConfirmationText>{t('auth.signup.invitationSuccessMessage')}</ConfirmationText>
      <Button onClick={() => { onClose?.(); navigate('/profile'); }} style={{ marginTop: theme.spacing[4] }}>
        {t('auth.signup.invitationSuccessButton')}
      </Button>
    </ConfirmationContainer>
  );

  const formContent = (
    <>
      {showConfirmation ? (
        <ConfirmationContainer>
          <EmailIcon>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </EmailIcon>
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
          <Text size="sm" style={{ color: '#666', marginTop: '1rem' }}>{t('auth.signup.confirmEmail.checkSpam')}</Text>
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
          {displayError && <ErrorMessage>{displayError}</ErrorMessage>}
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap={4}>
              <div>
                <Text size="sm" weight="medium" style={{ marginBottom: theme.spacing[2] }}>{t('auth.signup.name')}</Text>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.signup.namePlaceholder')} required autoComplete="name" />
              </div>
              <div>
                <Text size="sm" weight="medium" style={{ marginBottom: theme.spacing[2] }}>{t('auth.signup.email')}</Text>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.signup.emailPlaceholder')} required autoComplete="email" />
              </div>
              <div>
                <Text size="sm" weight="medium" style={{ marginBottom: theme.spacing[2] }}>{t('auth.signup.password')}</Text>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.signup.passwordPlaceholder')} required minLength={6} autoComplete="new-password" />
                <PasswordHint>{t('auth.signup.passwordHint')}</PasswordHint>
              </div>
              <CheckboxContainer>
                <input type="checkbox" checked={marketingOptIn} onChange={(e) => setMarketingOptIn(e.target.checked)} />
                <span>
                  <Trans i18nKey="auth.signup.marketing" components={{ privacyLink: <Link to="/privacy" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: theme.colors.primary[600], textDecoration: 'underline', textUnderlineOffset: '2px', fontWeight: 500 }} /> }} />
                </span>
              </CheckboxContainer>
              <Button type="submit" disabled={loading} style={{ marginTop: theme.spacing[2] }}>
                {loading ? <Spinner size="20px" color="white" /> : t('auth.signup.submit')}
              </Button>
            </Flex>
          </form>
          <Text size="sm" style={{ textAlign: 'center', marginTop: theme.spacing[6] }}>
            {t('auth.signup.hasAccount')}{' '}
            <Link to="/login" style={{ color: theme.colors.primary[600], fontWeight: 'bold' }} onClick={asModal && onClose ? (e) => { e.preventDefault(); onClose(); navigate('/login'); } : undefined}>
              {t('auth.signup.loginLink')}
            </Link>
          </Text>
        </>
      )}
    </>
  );

  if (asModal && onClose) {
    return createPortal(
      <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={t('auth.signup.title')}>
        <div style={{ position: 'relative', background: 'white', borderRadius: 20, maxWidth: 450, width: '100%', padding: theme.spacing[6], maxHeight: 'calc(100dvh - 2rem)', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
          <ModalCloseBtn type="button" onClick={onClose} aria-label={t('common.close')}>×</ModalCloseBtn>
          <CardBody>{showInvitationSuccess ? invitationSuccessContent : formContent}</CardBody>
        </div>
      </ModalOverlay>,
      document.body
    );
  }

  return (
    <PageWrapper>
      <Header>
        <BackButton to="/">
          ← {t('common.backToHome')}
        </BackButton>
        <BrandName to="/">Emmanuelle K</BrandName>
        <div style={{ width: '100px' }} /> {/* Spacer for centering */}
      </Header>
      
      <AuthContainer>
        <AuthCard>
          <CardBody>
            {showConfirmation ? (
              <ConfirmationContainer>
                <EmailIcon>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </EmailIcon>
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
                
                {displayError && <ErrorMessage>{displayError}</ErrorMessage>}
                
                <form onSubmit={handleSubmit}>
                  <Flex direction="column" gap={4}>
                    <div>
                      <Text size="sm" weight="medium" style={{ marginBottom: theme.spacing[2] }}>
                        {t('auth.signup.name')}
                      </Text>
                      <Input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder={t('auth.signup.namePlaceholder')}
                        required 
                        autoComplete="name"
                      />
                    </div>
                    
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
                      <span>
                        <Trans
                          i18nKey="auth.signup.marketing"
                          components={{
                            privacyLink: (
                              <Link 
                                to="/privacy" 
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ 
                                  color: theme.colors.primary[600], 
                                  textDecoration: 'underline',
                                  textUnderlineOffset: '2px',
                                  fontWeight: 500
                                }}
                              />
                            )
                          }}
                        />
                      </span>
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
