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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
  }
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
      case 'warning': 
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'error': 
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'success': 
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      default: 
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
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

