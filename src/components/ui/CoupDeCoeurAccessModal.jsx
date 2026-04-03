import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.emmanuellek.com/api';

const STORAGE_KEY = 'coupDeCoeurUnlocked';
const EXPIRY_HOURS = 24;

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

export function getCoupDeCoeurUnlocked() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { expiry } = JSON.parse(raw);
    return typeof expiry === 'number' && Date.now() < expiry;
  } catch {
    return false;
  }
}

function setCoupDeCoeurUnlocked() {
  const expiry = Date.now() + EXPIRY_HOURS * 60 * 60 * 1000;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ expiry }));
}

const CoupDeCoeurAccessModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollYRef = useRef(0);

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
    if (!password.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/coup-de-coeur/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const isUnauthorized = response.status === 401;
        setError(
          isUnauthorized
            ? t('coupDeCoeur.accessModal.errorWrong')
            : (data.error || t('coupDeCoeur.accessModal.errorNetwork'))
        );
        setLoading(false);
        return;
      }

      if (data.verified) {
        setCoupDeCoeurUnlocked();
        onClose();
        onSuccess();
      } else {
        setError(t('coupDeCoeur.accessModal.errorWrong'));
      }
    } catch (err) {
      console.error('Coup de coeur verify error:', err);
      setError(t('coupDeCoeur.accessModal.errorNetwork'));
    }
    setLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <Overlay onClick={handleOverlayClick}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-label={t('coupDeCoeur.accessModal.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton type="button" onClick={onClose} aria-label={t('common.close')}>
          ×
        </CloseButton>

        <Title>{t('coupDeCoeur.accessModal.title')}</Title>
        <Subtitle>{t('coupDeCoeur.accessModal.prompt')}</Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>{t('coupDeCoeur.accessModal.passwordPlaceholder')}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('coupDeCoeur.accessModal.passwordPlaceholder')}
              autoComplete="current-password"
              autoFocus
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading
              ? t('coupDeCoeur.accessModal.submitting')
              : t('coupDeCoeur.accessModal.submit')}
          </SubmitButton>
        </Form>
      </Modal>
    </Overlay>,
    document.body
  );
};

export default CoupDeCoeurAccessModal;
