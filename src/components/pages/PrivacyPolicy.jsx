import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useSEO } from '../../hooks/useSEO'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const PrivacyContainer = styled.div`
  min-height: 100vh;
  background: #FDFCF8;
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
  
  @media (min-width: 480px) {
    font-size: 0.9rem;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    margin-right: 1rem;
  }
  
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
  
  @media (min-width: 480px) {
    font-size: 1.05rem;
  }
  
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

const List = styled.ul`
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
`

const ListItem = styled.li`
  font-size: 0.95rem;
  line-height: 1.7;
  color: #333;
  margin-bottom: 0.5rem;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`

const SubSectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
  color: #101010;
  
  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`

const ContactInfo = styled.div`
  background: #f8f8f8;
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

function PrivacyPolicy() {
  const { t } = useTranslation()

  useSEO({
    title: t('privacy.title', 'Politique de Confidentialité - EMMANUELLE K'),
    description: t('privacy.description', 'Consultez notre politique de confidentialité pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles.')
  })

  return (
    <PrivacyContainer>
      <Header>
        <BackButton to="/">
          ← {t('common.backToHome')}
        </BackButton>
        <BrandName to="/">Emmanuelle K</BrandName>
        <LanguageSwitcher />
      </Header>
      
      <Content>
        <Title>{t('privacy.title', 'Politique de Confidentialité')}</Title>
        <LastUpdated>
          {t('privacy.lastUpdated', 'Dernière mise à jour : {{date}}', { date: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) })}
        </LastUpdated>

        <Section>
          <SectionTitle>{t('privacy.introduction.title', '1. Introduction')}</SectionTitle>
          <Paragraph>
            {t('privacy.introduction.text', 'Emmanuelle K (« nous », « notre » ou « nos ») s\'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lorsque vous utilisez notre site web et nos services.')}
          </Paragraph>
          <Paragraph>
            {t('privacy.introduction.text2', 'En utilisant notre site, vous acceptez les pratiques décrites dans cette politique. Si vous n\'acceptez pas cette politique, veuillez ne pas utiliser notre site.')}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{t('privacy.dataCollection.title', '2. Données que nous collectons')}</SectionTitle>
          <Paragraph>
            {t('privacy.dataCollection.intro', 'Nous collectons les types de données suivants :')}
          </Paragraph>
          
          <SubSectionTitle>{t('privacy.dataCollection.personal.title', '2.1. Données personnelles')}</SubSectionTitle>
          <List>
            <ListItem>{t('privacy.dataCollection.personal.name', 'Nom et prénom')}</ListItem>
            <ListItem>{t('privacy.dataCollection.personal.email', 'Adresse e-mail')}</ListItem>
            <ListItem>{t('privacy.dataCollection.personal.address', 'Adresse de livraison et de facturation')}</ListItem>
            <ListItem>{t('privacy.dataCollection.personal.phone', 'Numéro de téléphone (optionnel)')}</ListItem>
            <ListItem>{t('privacy.dataCollection.personal.payment', 'Informations de paiement (traitées de manière sécurisée par nos prestataires de paiement)')}</ListItem>
          </List>

          <SubSectionTitle>{t('privacy.dataCollection.usage.title', '2.2. Données d\'utilisation')}</SubSectionTitle>
          <List>
            <ListItem>{t('privacy.dataCollection.usage.ip', 'Adresse IP')}</ListItem>
            <ListItem>{t('privacy.dataCollection.usage.browser', 'Type de navigateur et version')}</ListItem>
            <ListItem>{t('privacy.dataCollection.usage.device', 'Type d\'appareil et système d\'exploitation')}</ListItem>
            <ListItem>{t('privacy.dataCollection.usage.pages', 'Pages visitées et temps passé sur le site')}</ListItem>
            <ListItem>{t('privacy.dataCollection.usage.referrer', 'Site web d\'origine (referrer)')}</ListItem>
          </List>

          <SubSectionTitle>{t('privacy.dataCollection.preferences.title', '2.3. Préférences et favoris')}</SubSectionTitle>
          <Paragraph>
            {t('privacy.dataCollection.preferences.text', 'Nous stockons vos préférences de style, marques favorites, et articles sauvegardés dans vos favoris pour personnaliser votre expérience.')}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{t('privacy.howWeUse.title', '3. Comment nous utilisons vos données')}</SectionTitle>
          <Paragraph>
            {t('privacy.howWeUse.intro', 'Nous utilisons vos données personnelles pour :')}
          </Paragraph>
          <List>
            <ListItem>{t('privacy.howWeUse.process', 'Traiter et exécuter vos commandes')}</ListItem>
            <ListItem>{t('privacy.howWeUse.communication', 'Vous contacter concernant vos commandes, livraisons et services')}</ListItem>
            <ListItem>{t('privacy.howWeUse.personalization', 'Personnaliser votre expérience et vous proposer des recommandations')}</ListItem>
            <ListItem>{t('privacy.howWeUse.account', 'Gérer votre compte et vos préférences')}</ListItem>
            <ListItem>{t('privacy.howWeUse.marketing', 'Vous envoyer des communications marketing (avec votre consentement)')}</ListItem>
            <ListItem>{t('privacy.howWeUse.improvement', 'Améliorer notre site et nos services')}</ListItem>
            <ListItem>{t('privacy.howWeUse.security', 'Assurer la sécurité et prévenir la fraude')}</ListItem>
            <ListItem>{t('privacy.howWeUse.legal', 'Respecter nos obligations légales')}</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>{t('privacy.dataSharing.title', '4. Partage de données')}</SectionTitle>
          <Paragraph>
            {t('privacy.dataSharing.intro', 'Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations avec :')}
          </Paragraph>
          <List>
            <ListItem>
              <strong>{t('privacy.dataSharing.providers', 'Prestataires de services :')}</strong>{' '}
              {t('privacy.dataSharing.providers.text', 'Prestataires de paiement (Stripe), services de livraison, hébergement web, et outils d\'analyse')}
            </ListItem>
            <ListItem>
              <strong>{t('privacy.dataSharing.legal', 'Obligations légales :')}</strong>{' '}
              {t('privacy.dataSharing.legal.text', 'Lorsque requis par la loi ou pour protéger nos droits')}
            </ListItem>
            <ListItem>
              <strong>{t('privacy.dataSharing.business', 'Transferts d\'entreprise :')}</strong>{' '}
              {t('privacy.dataSharing.business.text', 'En cas de fusion, acquisition ou vente d\'actifs')}
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>{t('privacy.cookies.title', '5. Cookies et technologies similaires')}</SectionTitle>
          <Paragraph>
            {t('privacy.cookies.intro', 'Nous utilisons des cookies et technologies similaires pour :')}
          </Paragraph>
          <List>
            <ListItem>{t('privacy.cookies.essential', 'Assurer le fonctionnement essentiel du site')}</ListItem>
            <ListItem>{t('privacy.cookies.preferences', 'Mémoriser vos préférences et paramètres')}</ListItem>
            <ListItem>{t('privacy.cookies.analytics', 'Analyser l\'utilisation du site et améliorer nos services')}</ListItem>
            <ListItem>{t('privacy.cookies.marketing', 'Vous proposer des publicités personnalisées (avec votre consentement)')}</ListItem>
          </List>
          <Paragraph>
            {t('privacy.cookies.control', 'Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.')}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{t('privacy.dataSecurity.title', '6. Sécurité des données')}</SectionTitle>
          <Paragraph>
            {t('privacy.dataSecurity.text', 'Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre l\'accès non autorisé, la perte, la destruction ou l\'altération. Cependant, aucune méthode de transmission sur Internet n\'est 100% sécurisée.')}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{t('privacy.yourRights.title', '7. Vos droits')}</SectionTitle>
          <Paragraph>
            {t('privacy.yourRights.intro', 'Conformément au RGPD et aux lois applicables, vous avez le droit de :')}
          </Paragraph>
          <List>
            <ListItem>{t('privacy.yourRights.access', 'Accéder à vos données personnelles')}</ListItem>
            <ListItem>{t('privacy.yourRights.rectify', 'Rectifier vos données inexactes ou incomplètes')}</ListItem>
            <ListItem>{t('privacy.yourRights.delete', 'Demander la suppression de vos données')}</ListItem>
            <ListItem>{t('privacy.yourRights.limit', 'Limiter le traitement de vos données')}</ListItem>
            <ListItem>{t('privacy.yourRights.portability', 'Demander la portabilité de vos données')}</ListItem>
            <ListItem>{t('privacy.yourRights.object', 'Vous opposer au traitement de vos données')}</ListItem>
            <ListItem>{t('privacy.yourRights.withdraw', 'Retirer votre consentement à tout moment')}</ListItem>
            <ListItem>{t('privacy.yourRights.complain', 'Déposer une plainte auprès d\'une autorité de contrôle')}</ListItem>
          </List>
          <Paragraph>
            {t('privacy.yourRights.contact', 'Pour exercer ces droits, contactez-nous à l\'adresse indiquée ci-dessous.')}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{t('privacy.dataRetention.title', '8. Conservation des données')}</SectionTitle>
          <Paragraph>
            {t('privacy.dataRetention.text', 'Nous conservons vos données personnelles aussi longtemps que nécessaire pour les finalités décrites dans cette politique, sauf si une période de conservation plus longue est requise ou autorisée par la loi.')}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{t('privacy.children.title', '9. Protection des mineurs')}</SectionTitle>
          <Paragraph>
            {t('privacy.children.text', 'Notre site n\'est pas destiné aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de données personnelles auprès de mineurs. Si vous êtes parent ou tuteur et que vous pensez que votre enfant nous a fourni des données personnelles, contactez-nous.')}
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>{t('privacy.changes.title', '10. Modifications de cette politique')}</SectionTitle>
          <Paragraph>
            {t('privacy.changes.text', 'Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement significatif en publiant la nouvelle politique sur cette page et en mettant à jour la date de « dernière mise à jour ».')}
          </Paragraph>
        </Section>

        <ContactInfo>
          <ContactTitle>{t('privacy.contact.title', 'Contact')}</ContactTitle>
          <ContactText>
            {t('privacy.contact.text', 'Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, veuillez nous contacter à :')}
          </ContactText>
          <ContactText style={{ marginTop: '0.5rem' }}>
            <strong>Email :</strong> contact@emmanuellek.com
          </ContactText>
        </ContactInfo>
      </Content>
    </PrivacyContainer>
  )
}

export default PrivacyPolicy
