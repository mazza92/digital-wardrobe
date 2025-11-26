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
    console.log('AuthCallback mounted. Hash:', hash);

    // Parse hash parameters
    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const hashError = hashParams.get('error');
    const hashErrorCode = hashParams.get('error_code');
    const hashErrorDescription = hashParams.get('error_description');

    console.log('Parsed:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      error: hashError,
      errorCode: hashErrorCode 
    });

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

    // If we have tokens, set session and redirect
    if (accessToken && refreshToken) {
      console.log('Have tokens, setting session...');
      setStatus('success');
      setRedirecting(true);

      // Clear hash immediately
      window.history.replaceState(null, '', '/auth/callback');

      // Fire and forget - don't wait for this at all
      // The storage error may cause the promise to hang
      try {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
      } catch (e) {
        console.log('setSession sync error:', e);
      }

      // Redirect immediately with a small delay for UI feedback
      console.log('Redirecting to onboarding...');
      setTimeout(() => {
        window.location.href = '/onboarding';
      }, 1000);

      return;
    }

    // No tokens - check if we already have a session
    if (!hash || hash === '#') {
      console.log('No hash, checking for existing session...');

      safeGetSession().then(({ data }) => {
        if (data?.session) {
          console.log('Found existing session');
          setStatus('success');
          setRedirecting(true);
          window.location.href = '/onboarding';
        } else {
          console.log('No session found');
          setStatus('error');
          setError('No authentication data found. Please sign up again.');
          setTimeout(() => {
            window.location.href = '/signup';
          }, 3000);
        }
      }).catch(err => {
        console.error('Session check failed:', err);
        // Try redirecting anyway
        setStatus('success');
        setRedirecting(true);
        window.location.href = '/onboarding';
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
            <SuccessIcon>✓</SuccessIcon>
            <Title>{t('auth.callback.success', 'Email confirmed!')}</Title>
            <Message>{t('auth.callback.redirecting', 'Redirecting you to complete your profile...')}</Message>
          </>
        )}
        
        {status === 'error' && (
          <>
            <SuccessIcon>⚠️</SuccessIcon>
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
