import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

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
  -webkit-overflow-scrolling: touch;

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }

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

const BackToHomeLink = styled.button`
  display: block;
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: none;
  border: none;
  font-size: 0.95rem;
  color: #666;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #1a1a1a;
  }
`;

/** Get first name from user (Supabase user_metadata or profile) */
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

const SecretsAccessModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollYRef = useRef(0);

  const isAuthenticated = !!user;
  const firstName = getFirstName(user);

  if (!isOpen) return null;

  useEffect(() => {
    scrollYRef.current = window.scrollY || 0;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
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
    setError('');
    if (!password.trim()) {
      setError(t('shop.secretsAccess.errorEmpty', 'Veuillez saisir un mot de passe.'));
      return;
    }
    setLoading(true);
    try {
      const secretsPassword = import.meta.env.VITE_SECRETS_PASSWORD;
      if (secretsPassword !== undefined && secretsPassword !== '' && password.trim() !== secretsPassword) {
        setError(t('shop.secretsAccess.errorWrong', 'Mot de passe incorrect.'));
        setLoading(false);
        return;
      }
      onClose();
      // Optional: store that user "unlocked" secrets for this session
      if (password.trim()) {
        sessionStorage.setItem('secretsUnlocked', '1');
      }
    } catch (err) {
      setError(t('shop.secretsAccess.errorGeneric', 'Une erreur s\'est produite.'));
    }
    setLoading(false);
  };

  const handleBackToHome = () => {
    onClose();
    navigate('/');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const welcomeTitle = firstName
    ? t('shop.secretsAccess.welcomeName', { name: firstName, defaultValue: `Bienvenue ${firstName}` })
    : t('shop.secretsAccess.welcome', 'Bienvenue');

  return createPortal(
    <Overlay onClick={handleOverlayClick}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-label={welcomeTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton type="button" onClick={onClose} aria-label={t('common.close')}>
          ×
        </CloseButton>

        <Title>{welcomeTitle}</Title>
        <Subtitle>{t('shop.secretsAccess.question', 'Avez-vous un mot de passe pour accéder à mes secrets ?')}</Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>{t('shop.secretsAccess.passwordLabel', 'Mot de passe')}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('shop.secretsAccess.passwordPlaceholder', 'Votre mot de passe')}
              autoComplete="current-password"
              autoFocus
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? t('shop.secretsAccess.submitting', 'Vérification...') : t('shop.secretsAccess.submit', 'Accéder')}
          </SubmitButton>
        </Form>

        <BackToHomeLink type="button" onClick={handleBackToHome}>
          {t('common.backToHome', 'Accueil')}
        </BackToHomeLink>
      </Modal>
    </Overlay>,
    document.body
  );
};

export default SecretsAccessModal;
