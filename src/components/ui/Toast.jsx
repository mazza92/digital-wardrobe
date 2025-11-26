import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
`;

const ToastItem = styled.div`
  background: ${props => props.$type === 'warning' ? '#fff3cd' : props.$type === 'error' ? '#f8d7da' : '#1a1a1a'};
  color: ${props => props.$type === 'warning' ? '#856404' : props.$type === 'error' ? '#721c24' : 'white'};
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  font-size: 0.95rem;
  font-weight: 500;
  animation: ${props => props.$isLeaving ? slideOut : slideIn} 0.3s ease forwards;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 90vw;
  
  @media (min-width: 768px) {
    max-width: 400px;
  }
`;

const ToastIcon = styled.span`
  font-size: 1.25rem;
`;

const ToastMessage = styled.span`
  flex: 1;
`;

// Toast context for global access
let toastHandler = null;

export const showToast = (message, type = 'info', duration = 3000) => {
  if (toastHandler) {
    toastHandler(message, type, duration);
  }
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastHandler = (message, type, duration) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type, isLeaving: false }]);
      
      // Start leaving animation
      setTimeout(() => {
        setToasts(prev => 
          prev.map(t => t.id === id ? { ...t, isLeaving: true } : t)
        );
      }, duration - 300);
      
      // Remove toast
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    };

    return () => {
      toastHandler = null;
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '💝';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <ToastContainer>
      {toasts.map(toast => (
        <ToastItem key={toast.id} $type={toast.type} $isLeaving={toast.isLeaving}>
          <ToastIcon>{getIcon(toast.type)}</ToastIcon>
          <ToastMessage>{toast.message}</ToastMessage>
        </ToastItem>
      ))}
    </ToastContainer>
  );
};

export default Toast;

