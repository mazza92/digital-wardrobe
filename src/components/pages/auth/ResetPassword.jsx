import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase, safeGetSession } from '../../../utils/supabaseClient';

const Page = styled.div`
  min-height: 100vh;
  background: #fdfcf8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
`;

const Card = styled.div`
  width: 100%;
  max-width: 430px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const Title = styled.h1`
  margin: 0 0 0.4rem 0;
  font-size: 1.5rem;
  color: #111;
`;

const Subtitle = styled.p`
  margin: 0 0 1.1rem 0;
  color: #666;
  font-size: 0.92rem;
  line-height: 1.45;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  color: #333;
  margin: 0.6rem 0 0.35rem;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e2e2e2;
  border-radius: 10px;
  padding: 0.78rem 0.9rem;
  font-size: 0.95rem;
  background: #fafafa;
  &:focus {
    outline: none;
    border-color: #111;
    background: #fff;
  }
`;

const Button = styled.button`
  margin-top: 1rem;
  width: 100%;
  border: none;
  border-radius: 12px;
  background: #111;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.85rem 1rem;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  margin-top: 0.8rem;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  font-size: 0.86rem;
  background: ${props => props.$error ? '#fff1f2' : '#f0fdf4'};
  border: 1px solid ${props => props.$error ? '#fecdd3' : '#bbf7d0'};
  color: ${props => props.$error ? '#be123c' : '#166534'};
`;

const Footer = styled.div`
  margin-top: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  a {
    color: #111;
    font-weight: 600;
  }
`;

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('checking'); // checking | ready | success | error
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrapRecoverySession = async () => {
      try {
        const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (accessToken && refreshToken && type === 'recovery') {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (mounted) {
            setStatus('ready');
            setFeedback('');
          }
          return;
        }

        const { data: { session } } = await safeGetSession();
        if (session?.user) {
          if (mounted) {
            setStatus('ready');
            setFeedback('');
          }
        } else if (mounted) {
          setStatus('error');
          setFeedback(t('auth.login.resetInvalidLink', 'This reset link is invalid or expired. Please request a new one.'));
        }
      } catch {
        if (mounted) {
          setStatus('error');
          setFeedback(t('auth.login.resetInvalidLink', 'This reset link is invalid or expired. Please request a new one.'));
        }
      }
    };

    bootstrapRecoverySession();
    return () => { mounted = false; };
  }, [t]);

  const canSubmit = useMemo(() => {
    return status === 'ready' && password.length >= 6 && confirmPassword.length >= 6 && !isSubmitting;
  }, [status, password.length, confirmPassword.length, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (password !== confirmPassword) {
      setStatus('error');
      setFeedback(t('auth.login.resetPasswordsMismatch', 'Passwords do not match.'));
      return;
    }

    setIsSubmitting(true);
    setFeedback('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus('success');
      setFeedback(t('auth.login.resetSuccess', 'Your password has been updated. You can now sign in.'));
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setStatus('error');
      setFeedback(err?.message || t('auth.login.resetFailed', 'Unable to reset password. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page>
      <Card>
        <Title>{t('auth.login.resetTitle', 'Set a new password')}</Title>
        <Subtitle>
          {t('auth.login.resetSubtitle', 'Enter your new password below to secure your account.')}
        </Subtitle>

        <form onSubmit={handleSubmit}>
          <Label>{t('auth.login.password')}</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.login.passwordPlaceholder')}
            autoComplete="new-password"
            disabled={status !== 'ready'}
            minLength={6}
          />
          <Label>{t('auth.login.resetConfirmPassword', 'Confirm password')}</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('auth.login.resetConfirmPlaceholder', 'Confirm your password')}
            autoComplete="new-password"
            disabled={status !== 'ready'}
            minLength={6}
          />
          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting
              ? t('auth.login.resetSubmitting', 'Updating...')
              : t('auth.login.resetSubmit', 'Update password')}
          </Button>
        </form>

        {feedback ? <Message $error={status === 'error'}>{feedback}</Message> : null}

        <Footer>
          <Link to="/login">{t('auth.login.title', 'Back to login')}</Link>
        </Footer>
      </Card>
    </Page>
  );
};

export default ResetPassword;
