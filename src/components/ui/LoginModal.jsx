import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getSafeRedirectPath, POST_LOGIN_REDIRECT_KEY } from '../../utils/authRedirect';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  animation: ${fadeIn} 0.2s ease;
  display: grid;
  place-items: center;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  box-sizing: border-box;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  
  /* Prevent body scroll when modal is open */
  overscroll-behavior: contain;
`;

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 420px;
  width: 100%;
  padding: 2.5rem 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${slideUp} 0.3s ease;
  position: relative;
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  margin: 0;
  
  /* Smooth scrolling */
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }
  
  /* Ensure modal is visible on small screens */
  @media (max-height: 600px) {
    max-height: calc(100dvh - 24px);
  }
`;

const CloseButton = styled.button`
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
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const IconContainer = styled.div`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #f8f4f0 0%, #e8e0d8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #1a1a1a;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
  border: 1px solid #bbf7d0;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  
  &:hover:not(:disabled) {
    background: #333;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FooterText = styled.p`
  text-align: center;
  margin: 1.5rem 0 0 0;
  font-size: 0.875rem;
  color: #666;
  
  button {
    background: none;
    border: none;
    color: #1a1a1a;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    
    &:hover {
      color: #333;
    }
  }
`;

const ForgotPasswordButton = styled.button`
  margin: -0.25rem 0 0.25rem 0;
  align-self: flex-start;
  background: none;
  border: none;
  color: #1a1a1a;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: 0;

  &:disabled {
    opacity: 0.75;
    cursor: pointer;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

function getFirstName(user) {
  if (!user) return null;
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.full_name ||
    user.name ||
    '';
  const first = (typeof name === 'string' && name.trim().split(/\s+/)[0]) || null;
  return first || null;
}

const LoginModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, forgotPassword, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetHint, setResetHint] = useState('');
  const scrollYRef = useRef(0);

  const firstName = getFirstName(user);
  const title = firstName
    ? t('auth.login.titleWithName', { name: firstName })
    : t('auth.login.title');

  if (!isOpen) return null;

  useEffect(() => {
    // Lock background scroll (best-practice)
    scrollYRef.current = window.scrollY || 0;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      onClose();
      let dest = null;
      try {
        dest = getSafeRedirectPath(sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY));
        sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      } catch { /* ignore */ }
      navigate(dest || '/');
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSignupClick = () => {
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    onClose();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('dw-open-signup-prompt', { detail: { redirect } }));
    }, 0);
  };

  const handleForgotPassword = async () => {
    if (!email?.trim()) {
      setResetSuccess('');
      setResetHint(t('auth.login.resetEmailRequired', 'Please enter your email first.'));
      return;
    }
    try {
      setResetHint('');
      await forgotPassword(email.trim());
      setResetSuccess(t('auth.login.resetPasswordSent', 'A password reset link has been sent to your email.'));
    } catch {
      setResetSuccess('');
    }
  };

  return createPortal(
    <Overlay onClick={handleOverlayClick}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton type="button" onClick={onClose}>
          ×
        </CloseButton>

        <IconContainer>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
          </svg>
        </IconContainer>
        <Title>{title}</Title>
        <Subtitle>{t('auth.login.subtitle')}</Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {resetSuccess && <SuccessMessage>{resetSuccess}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>{t('auth.login.email')}</Label>
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
              autoFocus
            />
          </InputGroup>

          <InputGroup>
            <Label>{t('auth.login.password')}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.login.passwordPlaceholder')}
              required
              autoComplete="current-password"
            />
          </InputGroup>

          <ForgotPasswordButton
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            {t('auth.login.forgotPassword')}
          </ForgotPasswordButton>
          {resetHint && <ErrorMessage>{resetHint}</ErrorMessage>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? <Spinner /> : t('auth.login.submit')}
          </SubmitButton>
        </Form>

        <FooterText>
          {t('auth.login.noAccount')}{' '}
          <button type="button" onClick={handleSignupClick}>
            {t('auth.login.signupLink')}
          </button>
        </FooterText>
      </Modal>
    </Overlay>,
    document.body
  );
};

export default LoginModal;

