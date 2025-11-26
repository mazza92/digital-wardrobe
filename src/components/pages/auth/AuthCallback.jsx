import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';

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
  const navigate = useNavigate();
  const { isAuthenticated, needsOnboarding, clearPendingSignup } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [error, setError] = useState(null);

  // Clear pending signup flag when we reach this page
  useEffect(() => {
    clearPendingSignup();
  }, [clearPendingSignup]);

  const checkExistingSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Found existing session, redirecting...');
        setStatus('success');
        setTimeout(() => {
          navigate('/onboarding', { replace: true });
        }, 500);
      } else {
        setStatus('error');
        setError('No session found. Please try signing up again.');
        setTimeout(() => {
          navigate('/signup', { replace: true });
        }, 2000);
      }
    } catch (err) {
      console.error('Error checking session:', err);
      setStatus('error');
      setError(err.message);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if we have hash params to process
    const hash = window.location.hash;
    
    const handleAuthCallback = async () => {
      // Debug: Log the full URL
      console.log('Auth callback URL:', window.location.href);
      console.log('Hash:', hash);
      
      // If no hash, check for existing session
      if (!hash || hash === '#') {
        console.log('No hash params, checking existing session...');
        checkExistingSession();
        return;
      }
      
      // Get the hash fragment from the URL (Supabase sends tokens in hash)
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      // Also check query params (some flows use query params)
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      const errorParam = queryParams.get('error');
      const errorDescription = queryParams.get('error_description');
      
      console.log('Parsed params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type, code: !!code, errorParam });

      // Handle error from Supabase
      if (errorParam) {
        setStatus('error');
        setError(errorDescription || errorParam);
        return;
      }

      // If we have tokens in the hash (email confirmation flow)
      if (accessToken && refreshToken) {
        console.log('Setting session with tokens from hash...');
        
        // Set session - this may throw storage errors but still work
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        }).then(({ data, error: sessionError }) => {
          console.log('setSession completed:', { data: !!data, error: sessionError });
          if (sessionError) {
            console.error('Session error:', sessionError);
          }
        }).catch(err => {
          console.log('setSession error (may still work):', err.message);
        });
        
        // Don't wait for setSession - the auth listener will handle it
        // Just show success and redirect after a delay
        setStatus('success');
        
        // Clear the hash from URL
        window.history.replaceState(null, '', '/auth/callback');
        
        // Redirect after giving time for auth state to update
        console.log('Redirecting to onboarding in 1.5s...');
        setTimeout(() => {
          console.log('Executing redirect now...');
          window.location.href = '/onboarding';
        }, 1500);
        return;
      }

      // If we have a code, exchange it for a session
      if (code) {
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setStatus('error');
            setError(exchangeError.message);
            return;
          }
          setStatus('success');
          setTimeout(() => {
            window.location.href = '/onboarding';
          }, 1500);
        } catch (err) {
          console.error('Code exchange error:', err);
          setStatus('error');
          setError(err.message);
        }
        return;
      }

      // If no tokens or code, check if already authenticated
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setTimeout(() => {
            window.location.href = '/onboarding';
          }, 1500);
        } else {
          setStatus('error');
          setError('No authentication data found. Please try signing up again.');
          setTimeout(() => {
            window.location.href = '/signup';
          }, 3000);
        }
      } catch (err) {
        console.error('Session check error:', err);
        // Even on error, try to redirect - session might exist
        setStatus('success');
        setTimeout(() => {
          window.location.href = '/onboarding';
        }, 1500);
      }
    };

    handleAuthCallback();
  }, [checkExistingSession]);

  // If already authenticated, redirect based on onboarding status
  useEffect(() => {
    if (isAuthenticated && status === 'success') {
      // Use hard redirect to ensure clean navigation
      const destination = needsOnboarding ? '/onboarding' : '/profile';
      console.log('Authenticated, redirecting to:', destination);
      window.location.href = destination;
    }
  }, [isAuthenticated, needsOnboarding, status]);

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

