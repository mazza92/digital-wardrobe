import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${slideUp} 0.3s ease;
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f8f4f0 0%, #e8e0d8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.75rem 0;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0 0 2rem 0;
`;

const Benefits = styled.ul`
  text-align: left;
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

const Benefit = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  font-size: 0.95rem;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const BenefitIcon = styled.span`
  font-size: 1.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PrimaryButton = styled.button`
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
  
  &:hover {
    background: #333;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

const TextLink = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    color: #333;
    text-decoration: underline;
  }
`;

const SignupPrompt = ({ isOpen, onClose, onContinueAsGuest, itemName }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignup = () => {
    onClose();
    navigate('/signup');
  };

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <IconContainer>💝</IconContainer>
        <Title>{t('signupPrompt.title')}</Title>
        <Description>
          {itemName 
            ? t('signupPrompt.description', { itemName })
            : t('signupPrompt.descriptionGeneric')}
        </Description>
        
        <Benefits>
          <Benefit>
            <BenefitIcon>💾</BenefitIcon>
            {t('signupPrompt.benefits.sync')}
          </Benefit>
          <Benefit>
            <BenefitIcon>🔔</BenefitIcon>
            {t('signupPrompt.benefits.alerts')}
          </Benefit>
          <Benefit>
            <BenefitIcon>👗</BenefitIcon>
            {t('signupPrompt.benefits.similar')}
          </Benefit>
          <Benefit>
            <BenefitIcon>✨</BenefitIcon>
            {t('signupPrompt.benefits.recommendations')}
          </Benefit>
        </Benefits>

        <ButtonGroup>
          <PrimaryButton onClick={handleSignup}>
            {t('signupPrompt.createAccount')}
          </PrimaryButton>
          <SecondaryButton onClick={handleLogin}>
            {t('signupPrompt.hasAccount')}
          </SecondaryButton>
        </ButtonGroup>
        
        {onContinueAsGuest && (
          <TextLink onClick={onContinueAsGuest}>
            {t('signupPrompt.continueAsGuest')}
          </TextLink>
        )}
      </Modal>
    </Overlay>
  );
};

export default SignupPrompt;
