// Design System - Reusable Components
// Standardized components with consistent naming and styling

import styled from 'styled-components'
import { theme } from './theme'

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const Container = styled.div`
  width: 100%;
  max-width: ${props => props.maxWidth || '1200px'};
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    padding: 0 ${theme.spacing[6]};
  }
`

export const Section = styled.section`
  padding: ${theme.spacing[12]} 0;
  
  @media (min-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing[16]} 0;
  }
`

export const Grid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['cols', 'colsMd', 'colsLg', 'gap', 'gapMd', 'gapLg'].includes(prop),
})`
  display: grid;
  grid-template-columns: repeat(${props => props.cols || 1}, 1fr);
  gap: ${props => theme.spacing[props.gap] || theme.spacing[4]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(${props => props.colsMd || props.cols || 1}, 1fr);
    gap: ${props => theme.spacing[props.gapMd] || theme.spacing[props.gap] || theme.spacing[6]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(${props => props.colsLg || props.colsMd || props.cols || 1}, 1fr);
    gap: ${props => theme.spacing[props.gapLg] || theme.spacing[props.gapMd] || theme.spacing[props.gap] || theme.spacing[8]};
  }
`

export const Flex = styled.div.withConfig({
  shouldForwardProp: (prop) => !['direction', 'align', 'justify', 'gap', 'wrap'].includes(prop),
})`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => props.align || 'stretch'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => theme.spacing[props.gap] || '0'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
`

export const Stack = styled.div.withConfig({
  shouldForwardProp: (prop) => !['gap'].includes(prop),
})`
  display: flex;
  flex-direction: column;
  gap: ${props => theme.spacing[props.gap] || theme.spacing[4]};
`

// ============================================================================
// TYPOGRAPHY COMPONENTS
// ============================================================================

export const Heading = styled.h1.withConfig({
  shouldForwardProp: (prop) => !['size', 'weight', 'lineHeight', 'color', 'letterSpacing', 'sizeMobile'].includes(prop),
})`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${props => theme.typography.fontSize[props.size] || theme.typography.fontSize['3xl']};
  font-weight: ${props => theme.typography.fontWeight[props.weight] || theme.typography.fontWeight.bold};
  line-height: ${props => theme.typography.lineHeight[props.lineHeight] || theme.typography.lineHeight.tight};
  color: ${props => getColor(props.color) || theme.colors.brand.primary};
  margin: 0;
  letter-spacing: ${props => theme.typography.letterSpacing[props.letterSpacing] || theme.typography.letterSpacing.tight};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${props => theme.typography.fontSize[props.sizeMobile] || theme.typography.fontSize['2xl']};
  }
`

export const Subheading = styled.h2.withConfig({
  shouldForwardProp: (prop) => !['size', 'weight', 'lineHeight', 'color', 'sizeMobile'].includes(prop),
})`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${props => theme.typography.fontSize[props.size] || theme.typography.fontSize['2xl']};
  font-weight: ${props => theme.typography.fontWeight[props.weight] || theme.typography.fontWeight.semibold};
  line-height: ${props => theme.typography.lineHeight[props.lineHeight] || theme.typography.lineHeight.snug};
  color: ${props => getColor(props.color) || theme.colors.brand.primary};
  margin: 0;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${props => theme.typography.fontSize[props.sizeMobile] || theme.typography.fontSize.xl};
  }
`

export const Text = styled.p.withConfig({
  shouldForwardProp: (prop) => !['size', 'weight', 'lineHeight', 'color'].includes(prop),
})`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${props => theme.typography.fontSize[props.size] || theme.typography.fontSize.base};
  font-weight: ${props => theme.typography.fontWeight[props.weight] || theme.typography.fontWeight.normal};
  line-height: ${props => theme.typography.lineHeight[props.lineHeight] || theme.typography.lineHeight.relaxed};
  color: ${props => getColor(props.color) || theme.colors.neutral[700]};
  margin: 0;
`

export const Caption = styled.span.withConfig({
  shouldForwardProp: (prop) => !['size', 'weight', 'color', 'uppercase'].includes(prop),
})`
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${props => theme.typography.fontSize[props.size] || theme.typography.fontSize.sm};
  font-weight: ${props => theme.typography.fontWeight[props.weight] || theme.typography.fontWeight.medium};
  color: ${props => getColor(props.color) || theme.colors.neutral[500]};
  text-transform: ${props => props.uppercase ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.uppercase ? theme.typography.letterSpacing.wide : 'normal'};
`

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================

export const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['size', 'variant'].includes(prop),
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  padding: ${props => {
    switch (props.size) {
      case 'sm': return `${theme.spacing[2]} ${theme.spacing[3]}`;
      case 'lg': return `${theme.spacing[4]} ${theme.spacing[6]}`;
      default: return `${theme.spacing[3]} ${theme.spacing[4]}`;
    }
  }};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return theme.typography.fontSize.sm;
      case 'lg': return theme.typography.fontSize.lg;
      default: return theme.typography.fontSize.base;
    }
  }};
  font-weight: ${theme.typography.fontWeight.semibold};
  line-height: 1;
  border: 1px solid transparent;
  border-radius: ${props => {
    switch (props.variant) {
      case 'pill': return theme.borderRadius.full;
      case 'square': return theme.borderRadius.md;
      default: return theme.borderRadius.lg;
    }
  }};
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  text-decoration: none;
  outline: none;
  
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: ${theme.colors.brand.primary};
          color: ${theme.colors.brand.surface};
          border-color: ${theme.colors.brand.primary};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.neutral[800]};
            border-color: ${theme.colors.neutral[800]};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.lg};
          }
        `;
      case 'secondary':
        return `
          background-color: transparent;
          color: ${theme.colors.brand.primary};
          border-color: ${theme.colors.neutral[300]};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.neutral[50]};
            border-color: ${theme.colors.neutral[400]};
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: ${theme.colors.neutral[600]};
          border-color: transparent;
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.neutral[100]};
            color: ${theme.colors.neutral[800]};
          }
        `;
      default:
        return `
          background-color: ${theme.colors.brand.primary};
          color: ${theme.colors.brand.surface};
          border-color: ${theme.colors.brand.primary};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.neutral[800]};
            border-color: ${theme.colors.neutral[800]};
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.lg};
          }
        `;
    }
  }}
`

// ============================================================================
// CARD COMPONENTS
// ============================================================================

export const Card = styled.div`
  background-color: ${theme.colors.brand.surface};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.base};
  overflow: hidden;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  
  &:hover {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }
`

export const CardHeader = styled.div`
  padding: ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.neutral[200]};
`

export const CardBody = styled.div`
  padding: ${theme.spacing[6]};
`

export const CardFooter = styled.div`
  padding: ${theme.spacing[6]};
  border-top: 1px solid ${theme.colors.neutral[200]};
  background-color: ${theme.colors.neutral[50]};
`

// ============================================================================
// BADGE COMPONENTS
// ============================================================================

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: 1;
  border-radius: ${theme.borderRadius.full};
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background-color: ${theme.colors.success[100]};
          color: ${theme.colors.success[800]};
        `;
      case 'warning':
        return `
          background-color: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[800]};
        `;
      case 'error':
        return `
          background-color: ${theme.colors.error[100]};
          color: ${theme.colors.error[800]};
        `;
      case 'info':
        return `
          background-color: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[800]};
        `;
      case 'outfit':
        return `
          background-color: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[800]};
        `;
      case 'wishlist':
        return `
          background-color: ${theme.colors.secondary[100]};
          color: ${theme.colors.secondary[800]};
        `;
      default:
        return `
          background-color: ${theme.colors.neutral[100]};
          color: ${theme.colors.neutral[800]};
        `;
    }
  }}
`

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

export const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${theme.colors.brand.primary};
  background-color: ${theme.colors.brand.surface};
  border: 1px solid ${theme.colors.neutral[300]};
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  
  &::placeholder {
    color: ${theme.colors.neutral[400]};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &:disabled {
    background-color: ${theme.colors.neutral[100]};
    color: ${theme.colors.neutral[400]};
    cursor: not-allowed;
  }
`

export const Textarea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${theme.colors.brand.primary};
  background-color: ${theme.colors.brand.surface};
  border: 1px solid ${theme.colors.neutral[300]};
  border-radius: ${theme.borderRadius.lg};
  resize: vertical;
  min-height: ${theme.spacing[20]};
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  
  &::placeholder {
    color: ${theme.colors.neutral[400]};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &:disabled {
    background-color: ${theme.colors.neutral[100]};
    color: ${theme.colors.neutral[400]};
    cursor: not-allowed;
  }
`

export const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${theme.colors.brand.primary};
  background-color: ${theme.colors.brand.surface};
  border: 1px solid ${theme.colors.neutral[300]};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &:disabled {
    background-color: ${theme.colors.neutral[100]};
    color: ${theme.colors.neutral[400]};
    cursor: not-allowed;
  }
`

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

export const Spinner = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'color'].includes(prop),
})`
  width: ${props => props.size || '24px'};
  height: ${props => props.size || '24px'};
  border: 2px solid ${theme.colors.neutral[200]};
  border-top: 2px solid ${props => getColor(props.color) || theme.colors.primary[500]};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

export const LoadingContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['minHeight'].includes(prop),
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[4]};
  min-height: ${props => props.minHeight || '200px'};
`

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getColor = (colorPath) => {
  if (!colorPath) return null;
  const keys = colorPath.split('.');
  return keys.reduce((obj, key) => obj?.[key], theme.colors);
}

export default {
  // Layout
  Container,
  Section,
  Grid,
  Flex,
  Stack,
  
  // Typography
  Heading,
  Subheading,
  Text,
  Caption,
  
  // Interactive
  Button,
  Input,
  Textarea,
  Select,
  
  // Display
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  
  // Loading
  Spinner,
  LoadingContainer,
}
