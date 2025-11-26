import React, { useState } from 'react';
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease;
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e0e0e0;
  }
  
  span {
    color: #999;
    font-size: 0.875rem;
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
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

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      onClose();
      navigate('/');
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
    onClose();
    if (onSwitchToSignup) {
      onSwitchToSignup();
    } else {
      navigate('/signup');
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <CloseButton onClick={onClose}>×</CloseButton>
        
        <IconContainer>👋</IconContainer>
        <Title>{t('auth.login.title')}</Title>
        <Subtitle>{t('auth.login.subtitle')}</Subtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>{t('auth.login.email')}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.login.emailPlaceholder')}
              required
              autoComplete="email"
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
          
          <SubmitButton type="submit" disabled={loading}>
            {loading ? <Spinner /> : t('auth.login.submit')}
          </SubmitButton>
        </Form>
        
        <Divider>
          <span>{t('common.or')}</span>
        </Divider>
        
        <SecondaryButton onClick={handleSignupClick}>
          {t('auth.login.signupLink')}
        </SecondaryButton>
        
        <FooterText>
          {t('auth.login.noAccount')}{' '}
          <button onClick={handleSignupClick}>
            {t('auth.login.signupLink')}
          </button>
        </FooterText>
      </Modal>
    </Overlay>
  );
};

export default LoginModal;

