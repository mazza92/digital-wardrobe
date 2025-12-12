import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://digital-wardrobe-admin.vercel.app/api'
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'https://digital-wardrobe-puce.vercel.app'

const Container = styled.div`
  min-height: 100vh;
  background: #FDFCF8;
`

const Header = styled.header`
  background: #F3F0E9;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`

const Logo = styled(Link)`
  font-size: 1.25rem;
  font-weight: 600;
  color: #101010;
  text-decoration: none;
  letter-spacing: 2px;
`

const Main = styled.main`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 3rem;
  }
`

const Section = styled.section`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
`

const FormGroup = styled.div`
  margin-bottom: 1rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.35rem;
  color: #333;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #101010;
    box-shadow: 0 0 0 3px rgba(16, 16, 16, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #101010;
    box-shadow: 0 0 0 3px rgba(16, 16, 16, 0.1);
  }
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`

const OrderSummary = styled.div`
  @media (min-width: 768px) {
    position: sticky;
    top: 2rem;
  }
`

const CartItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-of-type {
    border-bottom: none;
  }
`

const ItemImage = styled.img`
  width: 60px;
  height: 75px;
  object-fit: cover;
  border-radius: 8px;
`

const ItemDetails = styled.div`
  flex: 1;
`

const ItemName = styled.p`
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
`

const ItemMeta = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin: 0;
`

const ItemPrice = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  
  &.total {
    font-weight: 600;
    font-size: 1.1rem;
    padding-top: 1rem;
    margin-top: 0.5rem;
    border-top: 1px solid #eee;
  }
`

const PayButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #101010;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background: #333;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const SecureNote = styled.p`
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`

const EmptyCart = styled.div`
  text-align: center;
  padding: 3rem;
  
  p {
    margin: 0 0 1.5rem 0;
    color: #666;
  }
`

const BackToShop = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #101010;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border: 1px solid #101010;
  border-radius: 10px;
  transition: all 0.2s;
  
  &:hover {
    background: #101010;
    color: white;
  }
`

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'ES', name: 'Espagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AT', name: 'Autriche' },
  { code: 'GB', name: 'Royaume-Uni' }
]

const FREE_SHIPPING_THRESHOLD = 50
const SHIPPING_COST = 4.90

function Checkout() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { items, subtotal, clearCart, setIsLoading } = useCart()
  const { user, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: 'FR',
    note: ''
  })
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = subtotal + shippingCost

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.name) {
      setError(t('checkout.errorContact', 'Veuillez remplir vos informations de contact'))
      return false
    }
    if (!formData.line1 || !formData.city || !formData.postalCode) {
      setError(t('checkout.errorAddress', 'Veuillez remplir votre adresse de livraison'))
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t('checkout.errorEmail', 'Veuillez entrer une adresse email valide'))
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setIsProcessing(true)
    setIsLoading(true)

    try {
      const checkoutData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        customerEmail: formData.email,
        customerName: formData.name,
        shippingAddress: {
          line1: formData.line1,
          line2: formData.line2 || undefined,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone || undefined
        },
        customerId: isAuthenticated ? user?.id : undefined,
        customerNote: formData.note || undefined,
        successUrl: `${FRONTEND_URL}/checkout/success`,
        cancelUrl: `${FRONTEND_URL}/checkout`
      }

      const response = await fetch(`${API_BASE_URL}/shop/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      // Redirect to Stripe Checkout
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        throw new Error('No checkout session URL returned')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || t('checkout.errorGeneric', 'Une erreur est survenue. Veuillez réessayer.'))
    } finally {
      setIsProcessing(false)
      setIsLoading(false)
    }
  }

  const getItemName = (item) => {
    if (i18n.language === 'en' && item.nameEn) {
      return item.nameEn
    }
    return item.name
  }

  if (items.length === 0) {
    return (
      <Container>
        <Header>
          <Logo to="/">EMMANUELLE K</Logo>
        </Header>
        <Main style={{ display: 'block', maxWidth: '600px' }}>
          <Section>
            <EmptyCart>
              <p>{t('checkout.emptyCart', 'Votre panier est vide')}</p>
              <BackToShop to="/shop">
                ← {t('checkout.backToShop', 'Retour à la boutique')}
              </BackToShop>
            </EmptyCart>
          </Section>
        </Main>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Logo to="/">EMMANUELLE K</Logo>
      </Header>

      <Main>
        <div>
          <form onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}

            {/* Contact */}
            <Section>
              <SectionTitle>{t('checkout.contact', 'Contact')}</SectionTitle>
              <FormGroup>
                <Label>{t('checkout.email', 'Email')} *</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                />
              </FormGroup>
              <Row>
                <FormGroup>
                  <Label>{t('checkout.name', 'Nom complet')} *</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Prénom Nom"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>{t('checkout.phone', 'Téléphone')}</Label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+33 6 00 00 00 00"
                  />
                </FormGroup>
              </Row>
            </Section>

            {/* Shipping Address */}
            <Section>
              <SectionTitle>{t('checkout.shipping', 'Adresse de livraison')}</SectionTitle>
              <FormGroup>
                <Label>{t('checkout.address1', 'Adresse')} *</Label>
                <Input
                  type="text"
                  name="line1"
                  value={formData.line1}
                  onChange={handleChange}
                  placeholder="123 Rue de la Mode"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>{t('checkout.address2', 'Complément')}</Label>
                <Input
                  type="text"
                  name="line2"
                  value={formData.line2}
                  onChange={handleChange}
                  placeholder="Appartement, étage..."
                />
              </FormGroup>
              <Row>
                <FormGroup>
                  <Label>{t('checkout.city', 'Ville')} *</Label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Paris"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>{t('checkout.postalCode', 'Code postal')} *</Label>
                  <Input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="75001"
                    required
                  />
                </FormGroup>
              </Row>
              <FormGroup>
                <Label>{t('checkout.country', 'Pays')} *</Label>
                <Select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Select>
              </FormGroup>
            </Section>

            {/* Note */}
            <Section>
              <SectionTitle>{t('checkout.note', 'Note (optionnel)')}</SectionTitle>
              <Input
                as="textarea"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder={t('checkout.notePlaceholder', 'Instructions spéciales...')}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </Section>
          </form>
        </div>

        {/* Order Summary */}
        <OrderSummary>
          <Section>
            <SectionTitle>{t('checkout.summary', 'Récapitulatif')}</SectionTitle>
            
            {items.map((item) => (
              <CartItem key={item.productId}>
                <ItemImage src={item.imageUrl} alt={getItemName(item)} />
                <ItemDetails>
                  <ItemName>{getItemName(item)}</ItemName>
                  <ItemMeta>{t('checkout.qty', 'Qté')}: {item.quantity}</ItemMeta>
                </ItemDetails>
                <ItemPrice>{(item.price * item.quantity).toFixed(2)}€</ItemPrice>
              </CartItem>
            ))}

            <SummaryRow>
              <span>{t('checkout.subtotal', 'Sous-total')}</span>
              <span>{subtotal.toFixed(2)}€</span>
            </SummaryRow>
            <SummaryRow>
              <span>{t('checkout.shippingCost', 'Livraison')}</span>
              <span>{shippingCost === 0 ? t('checkout.free', 'Gratuit') : `${shippingCost.toFixed(2)}€`}</span>
            </SummaryRow>
            <SummaryRow className="total">
              <span>{t('checkout.total', 'Total')}</span>
              <span>{total.toFixed(2)}€</span>
            </SummaryRow>

            <PayButton 
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner" style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  {t('checkout.processing', 'Traitement...')}
                </>
              ) : (
                <>
                  🔒 {t('checkout.pay', 'Payer')} {total.toFixed(2)}€
                </>
              )}
            </PayButton>

            <SecureNote>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              {t('checkout.secure', 'Paiement sécurisé par Stripe')}
            </SecureNote>
          </Section>
        </OrderSummary>
      </Main>
    </Container>
  )
}

export default Checkout

