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
  margin: 0 0 2.5rem 0;
  color: #101010;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
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
  white-space: pre-line;

  @media (min-width: 768px) {
    font-size: 1rem;
  }

  &:last-child {
    margin-bottom: 0;
  }
`

function LegalInfo() {
  const { t, i18n } = useTranslation()
  const isFrench = i18n.language === 'fr'

  useSEO({
    title: isFrench ? 'Mentions légales - EMMANUELLE K' : 'Legal Notice - EMMANUELLE K',
    description: isFrench
      ? 'Mentions légales du site emmanuellek.com'
      : 'Legal notice for emmanuellek.com'
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
        {isFrench ? (
          <>
            <Title>Mentions légales</Title>

            <Section>
              <SectionTitle>Éditeur du site</SectionTitle>
              <Paragraph>
                Emmanuelle Koffi{'\n'}
                Entreprise individuelle{'\n'}
                SIRET : 853 201 713 00015{'\n'}
                Directrice de la publication : Emmanuelle Koffi
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Hébergement</SectionTitle>
              <Paragraph>
                Vercel Inc.{'\n'}
                340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis{'\n'}
                vercel.com
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Contenu du site</SectionTitle>
              <Paragraph>
                Ce site présente des sélections de looks et de contenus éditoriaux élaborés par Emmanuelle Koffi, accompagnés de références produits. Il propose également des ventes privées de pièces issues de sa garde-robe personnelle, ainsi que des fonctionnalités de sauvegarde et d'expression de préférence à destination des visiteurs enregistrés.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Propriété intellectuelle et brevet</SectionTitle>
              <Paragraph>
                Les photographies personnelles, contenus éditoriaux, textes et identité graphique publiés sur ce site sont la propriété exclusive d'Emmanuelle Koffi. Toute reproduction, représentation ou diffusion, même partielle, est interdite sans accord écrit préalable.
              </Paragraph>
              <Paragraph>
                Certaines fonctionnalités de ce site, notamment relatives à l'exploitation de visuels augmentés de hotspots interactifs, font l'objet d'un dépôt de brevet auprès de l'Institut National de la Propriété Industrielle (INPI).
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Ventes et produits</SectionTitle>
              <Paragraph>
                Ce site est susceptible de proposer à la vente des produits édités au nom d'Emmanuelle Koffi, ainsi que des pièces sélectionnées dans le cadre de ventes privées. La gestion administrative des commandes, l'expédition et le service après-vente sont assurés par un prestataire logistique partenaire.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Liens affiliés</SectionTitle>
              <Paragraph>
                Certains liens présents sur ce site, notamment dans les rubriques Looks et Éditos, sont susceptibles d'être des liens affiliés. En cas d'achat effectué via ces liens, une commission peut être perçue par l'éditrice du site. Cette relation commerciale n'a aucune incidence sur le prix payé par l'acheteur, ni sur l'indépendance éditoriale des contenus publiés.
              </Paragraph>
            </Section>
          </>
        ) : (
          <>
            <Title>Legal Notice</Title>

            <Section>
              <SectionTitle>Publisher</SectionTitle>
              <Paragraph>
                Emmanuelle Koffi{'\n'}
                Sole proprietorship (Entreprise individuelle){'\n'}
                SIRET: 853 201 713 00015{'\n'}
                Publication Director: Emmanuelle Koffi
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Hosting</SectionTitle>
              <Paragraph>
                Vercel Inc.{'\n'}
                340 Pine Street, Suite 701, San Francisco, CA 94104, United States{'\n'}
                vercel.com
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>About This Site</SectionTitle>
              <Paragraph>
                This site presents curated looks and editorial content by Emmanuelle Koffi, with associated product references. It also features private sales of personally selected wardrobe pieces, along with saving and preference features for registered visitors.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Intellectual Property and Patent</SectionTitle>
              <Paragraph>
                Personal photographs, editorial content, texts and graphic identity published on this site are the exclusive property of Emmanuelle Koffi. Any reproduction, distribution or representation, in whole or in part, is strictly prohibited without prior written consent.
              </Paragraph>
              <Paragraph>
                Certain features of this site, particularly relating to the use of visuals augmented with interactive hotspots, are the subject of a patent filing with the Institut National de la Propriété Industrielle (INPI).
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Sales and Products</SectionTitle>
              <Paragraph>
                This site may offer for sale products published under the Emmanuelle Koffi name, as well as curated pieces available through private sales. Order management, shipping and after-sales service are handled by a third-party logistics partner.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Affiliate Links</SectionTitle>
              <Paragraph>
                Some links on this site, particularly within the Looks and Editorials sections, may be affiliate links. Should a purchase be made through these links, a commission may be received by the site publisher. This does not affect the price paid by the buyer, nor the editorial independence of the content published on this site.
              </Paragraph>
            </Section>
          </>
        )}
      </Content>
    </LegalContainer>
  )
}

export default LegalInfo
