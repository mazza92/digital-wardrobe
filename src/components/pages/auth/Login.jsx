import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { Container, Card, CardBody, Heading, Input, Button, Text, Flex, Spinner } from '../../../design-system/components';
import { theme } from '../../../design-system/theme';

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

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error is handled by context and displayed
    } finally {
      setIsSubmitting(false);
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
            <Heading size="2xl" style={{ textAlign: 'center', marginBottom: theme.spacing[2] }}>
              {t('auth.login.title')}
            </Heading>
            <Subtitle>{t('auth.login.subtitle')}</Subtitle>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
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

                <Button type="submit" disabled={isSubmitting} style={{ marginTop: theme.spacing[2] }}>
                  {isSubmitting ? <Spinner size="20px" color="white" /> : t('auth.login.submit')}
                </Button>
              </Flex>
            </form>

            <Text size="sm" style={{ textAlign: 'center', marginTop: theme.spacing[6] }}>
              {t('auth.login.noAccount')}{' '}
              <Link to="/signup" style={{ color: theme.colors.primary[600], fontWeight: 'bold' }}>
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
