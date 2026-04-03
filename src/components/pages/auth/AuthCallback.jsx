import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { supabase, safeGetSession } from '../../../utils/supabaseClient';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #FDFCF8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 400px;
  width: 100%;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1a1a1a;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto 1.5rem;
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
`;

const Message = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
`;

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
`;

const AuthCallback = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Prevent double execution
    if (redirecting) return;

    const hash = window.location.hash;

    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const hashError = hashParams.get('error');
    const hashErrorCode = hashParams.get('error_code');
    const hashErrorDescription = hashParams.get('error_description');

    // Handle errors
    if (hashError) {
      setStatus('error');
      let errorMsg = hashErrorDescription || hashError;
      if (hashErrorCode === 'otp_expired') {
        errorMsg = 'This verification link has expired. Please sign up again.';
      }
      setError(errorMsg);
      
      setTimeout(() => {
        window.location.href = '/signup';
      }, 4000);
      return;
    }

    if (accessToken && refreshToken) {
      setStatus('success');
      setRedirecting(true);

      window.history.replaceState(null, '', '/auth/callback');

      try {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
      } catch (e) {}

      setTimeout(() => {
        window.location.href = '/profile';
      }, 1000);

      return;
    }

    if (!hash || hash === '#') {
      safeGetSession().then(({ data }) => {
        if (data?.session) {
          setStatus('success');
          setRedirecting(true);
          window.location.href = '/profile';
        } else {
          setStatus('error');
          setError('No authentication data found. Please sign up again.');
          setTimeout(() => {
            window.location.href = '/signup';
          }, 3000);
        }
      }).catch(err => {
        setStatus('success');
        setRedirecting(true);
        window.location.href = '/profile';
      });
    }
  }, [redirecting]);

  return (
    <PageWrapper>
      <Card>
        {status === 'loading' && (
          <>
            <Spinner />
            <Title>{t('auth.callback.verifying', 'Verifying your email...')}</Title>
            <Message>{t('auth.callback.pleaseWait', 'Please wait while we confirm your account.')}</Message>
          </>
        )}
        
        {status === 'success' && (
          <>
            <SuccessIcon>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </SuccessIcon>
            <Title>{t('auth.callback.success', 'Email confirmed!')}</Title>
            <Message>{t('auth.callback.redirecting', 'Redirecting you to complete your profile...')}</Message>
          </>
        )}
        
        {status === 'error' && (
          <>
            <SuccessIcon>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </SuccessIcon>
            <Title>{t('auth.callback.error', 'Verification failed')}</Title>
            <Message>{t('auth.callback.errorMessage', 'There was a problem verifying your email.')}</Message>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </>
        )}
      </Card>
    </PageWrapper>
  );
};

export default AuthCallback;
