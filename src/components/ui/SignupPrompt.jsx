import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getSafeRedirectPath } from '../../utils/authRedirect';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 9999;
  animation: ${fadeIn} 0.2s ease;
  display: grid;
  place-items: center;
  padding: 1rem;
  box-sizing: border-box;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
`;

const Modal = styled.div`
  background: white;
  border-radius: 24px;
  max-width: 380px;
  width: 100%;
  padding: 2.25rem 2rem 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${slideUp} 0.3s ease;
  position: relative;

  @media (max-width: 480px) {
    padding: 2rem 1.5rem 1.5rem;
    border-radius: 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #999;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  &:hover { background: #f5f5f5; color: #333; }
`;

const Title = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.35rem 0;
  line-height: 1.3;
`;

const Subtitle = styled.p`
  font-size: 0.88rem;
  color: #888;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const ErrorMsg = styled.div`
  background: #fff0f0;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const SuccessMsg = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const HintMsg = styled.div`
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1.25rem;
`;

const FieldLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #444;
`;

const Input = styled.input`
  padding: 0.7rem 0.9rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1a1a1a;
  background: #fafafa;
  outline: none;
  transition: border-color 0.2s ease;
  -webkit-appearance: none;

  &::placeholder { color: #bbb; }
  &:focus { border-color: #1a1a1a; background: #fff; }
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  line-height: 1.4;

  input[type="checkbox"] { margin-top: 2px; flex-shrink: 0; }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.9rem 1.5rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) { background: #333; transform: translateY(-1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Spinner = styled.span`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin { to { transform: rotate(360deg); } }
`;

const SignInLink = styled.p`
  margin: 1.1rem 0 0 0;
  font-size: 0.85rem;
  color: #888;
  text-align: center;

  button {
    background: none;
    border: none;
    color: #1a1a1a;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
    padding: 0;
    font-size: inherit;
    &:hover { color: #333; }
  }
`;

const ForgotPasswordButton = styled.button`
  margin-top: -0.3rem;
  margin-bottom: 0.6rem;
  background: none;
  border: none;
  color: #1a1a1a;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  padding: 0;
  align-self: flex-start;
`;

const SignupPrompt = ({
  isOpen,
  onClose,
  onContinueAsGuest,
  customButtonText = null,
  /** After login / signup, navigate here (e.g. /shop/sale/:id) */
  redirectAfterLogin = null,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, login, forgotPassword, loading, error, isAuthenticated, clearError } = useAuth();
  const scrollYRef = useRef(0);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'login'
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetHint, setResetHint] = useState('');

  // Body scroll lock while open
  useEffect(() => {
    if (!isOpen) return;
    scrollYRef.current = window.scrollY || 0;
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = '0';
    body.style.right = '0';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      window.scrollTo(0, scrollYRef.current);
    };
  }, [isOpen, onClose]);

  // Clear form + error when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName(''); setEmail(''); setPassword(''); setMarketingOptIn(false);
      setAuthMode('signup');
      setResetSuccess('');
      setResetHint('');
      clearError?.();
    }
  }, [isOpen, clearError]);

  // After successful auth (signup or login): add pending favorite then optionally redirect
  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;
    onContinueAsGuest?.();
    const safe = getSafeRedirectPath(redirectAfterLogin);
    onClose();
    if (safe) {
      navigate(safe, { replace: true });
    }
  }, [isAuthenticated, isOpen, onContinueAsGuest, onClose, redirectAfterLogin, navigate]);

  if (!isOpen) return null;

  const isAlreadyRegistered = error && /already registered|already exists|déjà utilisé|already in use|email.*exist/i.test(error);
  const displayError = authMode === 'signup'
    ? (isAlreadyRegistered ? t('auth.signup.alreadyRegisteredMessage') : error)
    : error;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      await login(email, password);
      return;
    }
    await signup(name, email, password, marketingOptIn);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setResetSuccess('');
    setResetHint('');
  };

  const handleForgotPassword = async () => {
    if (!email?.trim()) {
      setResetSuccess('');
      setResetHint(t('auth.login.resetEmailRequired', 'Please enter your email first.'));
      return;
    }
    try {
      await forgotPassword(email.trim());
      setResetHint('');
      setResetSuccess(t('auth.login.resetPasswordSent', 'A password reset link has been sent to your email.'));
    } catch {
      setResetSuccess('');
    }
  };

  return createPortal(
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-label={authMode === 'login' ? t('auth.login.title') : t('auth.signup.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton type="button" onClick={onClose} aria-label={t('common.close')}>×</CloseButton>

        <Title>{authMode === 'login' ? t('auth.login.title') : t('auth.signup.title')}</Title>
        <Subtitle>{authMode === 'login' ? t('auth.login.subtitle') : t('signupPrompt.simpleDescription')}</Subtitle>

        {displayError && <ErrorMsg>{displayError}</ErrorMsg>}
        {resetSuccess && <SuccessMsg>{resetSuccess}</SuccessMsg>}
        {resetHint && <HintMsg>{resetHint}</HintMsg>}

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            {authMode === 'signup' && (
              <FieldLabel>
                {t('auth.signup.name')}
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.signup.namePlaceholder')}
                  required
                  autoComplete="name"
                  autoFocus
                />
              </FieldLabel>
            )}

            <FieldLabel>
              {t('auth.login.email')}
              <Input
                type="email"
                value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (resetHint) setResetHint('');
                  }}
                placeholder={t('auth.login.emailPlaceholder')}
                required
                autoComplete="email"
                autoFocus={authMode === 'login'}
              />
            </FieldLabel>

            <FieldLabel>
              {t('auth.login.password')}
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.login.passwordPlaceholder')}
                required
                minLength={authMode === 'signup' ? 6 : undefined}
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              />
            </FieldLabel>

            {authMode === 'login' && (
              <ForgotPasswordButton
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                {t('auth.login.forgotPassword')}
              </ForgotPasswordButton>
            )}

            {authMode === 'signup' && (
              <CheckboxRow>
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
                          style={{ color: '#1a1a1a', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                        />
                      )
                    }}
                  />
                </span>
              </CheckboxRow>
            )}
          </FieldGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading
              ? <Spinner />
              : (authMode === 'login'
                ? t('auth.login.submit')
                : (customButtonText || t('auth.signup.submit')))}
          </SubmitButton>
        </form>

        <SignInLink>
          {authMode === 'signup' ? (
            <>
              {t('signupPrompt.alreadyHaveAccount')}{' '}
              <button type="button" onClick={handleLogin}>
                {t('signupPrompt.signInHere')}
              </button>
            </>
          ) : (
            <>
              {t('auth.login.noAccount')}{' '}
              <button type="button" onClick={() => setAuthMode('signup')}>
                {t('auth.login.signupLink')}
              </button>
            </>
          )}
        </SignInLink>
      </Modal>
    </Overlay>,
    document.body
  );
};

export default SignupPrompt;
