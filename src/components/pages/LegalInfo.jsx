import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useSEO } from '../../hooks/useSEO'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const LegalContainer = styled.div`
  min-height: 100vh;
  background: #fdfcf8;
  color: #101010;
`

const Header = styled.header`
  background: #fdfcf8;
  padding: 0.875rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 56px;

  @media (min-width: 480px) {
    padding: 1rem 1.25rem;
  }

  @media (min-width: 768px) {
    padding: 1.125rem 2rem;
    min-height: 64px;
  }
`

const BackButton = styled(Link)`
  color: #666;
  text-decoration: none;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  margin-right: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1rem;
    border-radius: 12px;
  }

  &:hover {
    color: #101010;
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateX(-2px);
  }
`

const BrandName = styled(Link)`
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.3px;
  color: #101010;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;

  @media (min-width: 768px) {
    font-size: 1.2rem;
    letter-spacing: 0.5px;
  }

  &:hover {
    opacity: 0.7;
  }
`

const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #101010;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`

const LastUpdated = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 2.5rem 0;
`

const Section = styled.section`
  margin-bottom: 2.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #101010;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`

const Paragraph = styled.p`
  font-size: 0.95rem;
  line-height: 1.7;
  color: #333;
  margin: 0 0 1rem 0;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`

const ContactInfo = styled.div`
  background: rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 2rem;
`

const ContactTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #101010;
`

const ContactText = styled.p`
  font-size: 0.95rem;
  line-height: 1.7;
  color: #333;
  margin: 0;
`

function LegalInfo() {
  const { t } = useTranslation()

  useSEO({
    title: t('legal.title', 'Legal Information - EMMANUELLE K'),
    description: t('legal.description', 'Legal information and publisher details for Virtual Dressing by Emmanuelle K.')
  })

  return (
    <LegalContainer>
      <Header>
        <BackButton to="/">
          ← {t('common.backToHome')}
        </BackButton>
        <BrandName to="/">Emmanuelle K</BrandName>
        <LanguageSwitcher />
      </Header>

      <Content>
        <Title>{t('legal.titlePage', 'Legal Information')}</Title>
        <LastUpdated>
          {t('legal.lastUpdated', 'Last updated: {{date}}', {
            date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
          })}
        </LastUpdated>

        <Section>
          <SectionTitle>{t('legal.publisher.title', 'Publisher')}</SectionTitle>
          <Paragraph>
            {t('legal.publisher.text', 'This website is published by Emmanuelle K. For any questions regarding legal information, please contact us.')}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{t('legal.hosting.title', 'Hosting')}</SectionTitle>
          <Paragraph>
            {t('legal.hosting.text', 'This site is hosted by Vercel Inc. You can find more information about the host in their terms of service.')}
          </Paragraph>
        </Section>

        <ContactInfo>
          <ContactTitle>{t('legal.contact.title', 'Contact')}</ContactTitle>
          <ContactText>
            {t('legal.contact.text', 'For any request concerning legal information:')}
          </ContactText>
          <ContactText style={{ marginTop: '0.5rem' }}>
            <strong>Email:</strong> contact@emmanuellek.com
          </ContactText>
        </ContactInfo>
      </Content>
    </LegalContainer>
  )
}

export default LegalInfo
