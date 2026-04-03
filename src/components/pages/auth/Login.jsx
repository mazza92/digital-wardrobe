import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { getSafeRedirectPath, POST_LOGIN_REDIRECT_KEY } from '../../../utils/authRedirect';
import { Container, Card, CardBody, Heading, Input, Button, Text, Flex, Spinner } from '../../../design-system/components';
import { theme } from '../../../design-system/theme';

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

const SuccessMessage = styled.div`
  color: #166534;
  margin-bottom: ${theme.spacing[4]};
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: ${theme.spacing[3]};
`;

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const { login, forgotPassword, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const resolvePostLoginPath = () => {
    const fromQuery = getSafeRedirectPath(searchParams.get('redirect'));
    const fromState = getSafeRedirectPath(location.state?.from);
    let fromStorage = null;
    try {
      fromStorage = getSafeRedirectPath(sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY));
    } catch { /* storage blocked */ }
    return fromQuery || fromState || fromStorage || null;
  };

  const clearStoredRedirect = () => {
    try {
      sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    } catch { /* ignore */ }
  };

  // Redirect if already authenticated (e.g. back button)
  useEffect(() => {
    if (!isAuthenticated) return;
    const dest = resolvePostLoginPath();
    clearStoredRedirect();
    navigate(dest || '/', { replace: true });
  }, [isAuthenticated, navigate, searchParams, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Redirect handled in useEffect when isAuthenticated becomes true
    } catch (err) {
      // Error is handled by context and displayed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email?.trim()) return;
    try {
      await forgotPassword(email.trim());
      setResetSuccess(t('auth.login.resetPasswordSent', 'A password reset link has been sent to your email.'));
    } catch {
      setResetSuccess('');
    }
  };
  
  // Show loading while checking auth status
  if (loading) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Spinner size="40px" />
        </div>
      </PageWrapper>
    );
  }

  const signupRedirect = getSafeRedirectPath(searchParams.get('redirect'));
  const signupTo = signupRedirect
    ? `/signup?redirect=${encodeURIComponent(signupRedirect)}`
    : '/signup';

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
            <Heading size="2xl" style={{ textAlign: 'center', marginBottom: theme.spacing[2] }}>
              {t('auth.login.title')}
            </Heading>
            <Subtitle>{t('auth.login.subtitle')}</Subtitle>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {resetSuccess && <SuccessMessage>{resetSuccess}</SuccessMessage>}
            
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap={4}>
                <div>
                  <Text size="sm" weight="medium" style={{ marginBottom: theme.spacing[2] }}>
                    {t('auth.login.email')}
                  </Text>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder={t('auth.login.emailPlaceholder')}
                    required 
                    autoComplete="email"
                  />
                </div>
                
                <div>
                  <Text size="sm" weight="medium" style={{ marginBottom: theme.spacing[2] }}>
                    {t('auth.login.password')}
                  </Text>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={t('auth.login.passwordPlaceholder')}
                    required 
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSubmitting || !email?.trim()}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#1a1a1a',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    fontWeight: 600,
                    fontSize: theme.typography.fontSize.sm,
                    cursor: isSubmitting || !email?.trim() ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting || !email?.trim() ? 0.55 : 1
                  }}
                >
                  {t('auth.login.forgotPassword')}
                </button>

                <Button type="submit" disabled={isSubmitting} style={{ marginTop: theme.spacing[2] }}>
                  {isSubmitting ? <Spinner size="20px" color="white" /> : t('auth.login.submit')}
                </Button>
              </Flex>
            </form>

            <Text size="sm" style={{ textAlign: 'center', marginTop: theme.spacing[6] }}>
              {t('auth.login.noAccount')}{' '}
              <Link to={signupTo} style={{ color: theme.colors.primary[600], fontWeight: 'bold' }}>
                {t('auth.login.signupLink')}
              </Link>
            </Text>
          </CardBody>
        </AuthCard>
      </AuthContainer>
    </PageWrapper>
  );
};

export default Login;
