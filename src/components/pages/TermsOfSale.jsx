import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useSEO } from '../../hooks/useSEO'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const PageContainer = styled.div`
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

function TermsOfSale() {
  const { t, i18n } = useTranslation()
  const isFrench = i18n.language === 'fr'

  useSEO({
    title: isFrench ? 'Conditions Générales de Vente - EMMANUELLE K' : 'Terms and Conditions of Sale - EMMANUELLE K',
    description: isFrench
      ? 'Conditions générales de vente du site emmanuellek.com'
      : 'Terms and conditions of sale for emmanuellek.com'
  })

  return (
    <PageContainer>
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
            <Title>Conditions Générales de Vente</Title>

            <Section>
              <SectionTitle>Article 1 — Objet</SectionTitle>
              <Paragraph>
                Les présentes Conditions Générales de Vente régissent l'ensemble des ventes de produits réalisées via le site emmanuellek.com, qu'il s'agisse de produits édités au nom d'Emmanuelle Koffi ou de pièces proposées dans le cadre de ventes privées. Tout achat implique l'acceptation pleine et entière des présentes conditions.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 2 — Prix</SectionTitle>
              <Paragraph>
                Les prix sont indiqués en euros, toutes taxes comprises. L'éditrice se réserve le droit de modifier ses prix à tout moment. Les produits sont facturés sur la base du tarif en vigueur au moment de la validation de la commande.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 3 — Commande</SectionTitle>
              <Paragraph>
                La commande est réputée ferme et définitive à réception de la confirmation de paiement. Un récapitulatif de commande est adressé à l'acheteur par voie électronique.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 4 — Paiement</SectionTitle>
              <Paragraph>
                Le paiement est exigible intégralement au moment de la commande. Les moyens de paiement acceptés sont précisés lors du processus d'achat. Les transactions sont sécurisées par le prestataire de paiement en charge du traitement des données bancaires.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 5 — Expédition et livraison</SectionTitle>
              <Paragraph>
                Les commandes sont traitées et expédiées par un prestataire logistique partenaire. Les délais de livraison sont indiqués à titre indicatif lors de la commande. L'éditrice ne saurait être tenue responsable de retards imputables au transporteur ou à des circonstances indépendantes de sa volonté.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 6 — Droit de rétractation</SectionTitle>
              <Paragraph>
                Conformément aux articles L.221-18 et suivants du Code de la consommation, l'acheteur dispose d'un délai de 14 jours à compter de la réception de sa commande pour exercer son droit de rétractation, sans avoir à motiver sa décision.
              </Paragraph>
              <Paragraph>
                Pour exercer ce droit, l'acheteur doit notifier sa décision par voie électronique, à l'adresse indiquée dans la confirmation de commande. Les frais de retour sont à la charge de l'acheteur. Le remboursement intervient dans un délai de 14 jours à compter de la réception du retour, dans un état identique à celui de l'expédition.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 7 — Service après-vente</SectionTitle>
              <Paragraph>
                Le service après-vente est assuré par le prestataire logistique partenaire, dont les coordonnées sont communiquées dans la confirmation de commande. Toute réclamation doit être adressée dans un délai raisonnable suivant la réception de la commande.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 8 — Droit applicable et litiges</SectionTitle>
              <Paragraph>
                Les présentes conditions sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux de Paris seront seuls compétents.
              </Paragraph>
            </Section>
          </>
        ) : (
          <>
            <Title>Terms and Conditions of Sale</Title>

            <Section>
              <SectionTitle>Article 1 — Scope</SectionTitle>
              <Paragraph>
                These Terms and Conditions of Sale govern all product purchases made through emmanuellek.com, whether branded products or pieces offered through private sales. Placing an order constitutes full acceptance of these terms.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 2 — Pricing</SectionTitle>
              <Paragraph>
                All prices are listed in euros, inclusive of applicable taxes. The publisher reserves the right to adjust pricing at any time. Products are billed at the price in effect at the time of order confirmation.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 3 — Orders</SectionTitle>
              <Paragraph>
                An order is considered firm and final upon receipt of payment confirmation. A summary will be sent to the buyer by email.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 4 — Payment</SectionTitle>
              <Paragraph>
                Full payment is required at the time of order. Accepted payment methods are specified during checkout. Transactions are processed securely by a certified payment provider.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 5 — Shipping and Delivery</SectionTitle>
              <Paragraph>
                Orders are processed and shipped by a third-party logistics partner. Delivery times are provided as estimates at checkout. The publisher cannot be held liable for delays caused by the carrier or circumstances beyond her control.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 6 — Right of Withdrawal</SectionTitle>
              <Paragraph>
                In accordance with applicable consumer protection law, buyers have 14 days from the date of receipt to exercise their right of withdrawal, without providing any reason.
              </Paragraph>
              <Paragraph>
                To do so, the buyer must notify their decision by email to the address provided in the order confirmation. Return shipping costs are the buyer's responsibility. Reimbursement will be issued within 14 days of receiving the returned item, provided it is returned in its original condition.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 7 — After-Sales Service</SectionTitle>
              <Paragraph>
                After-sales service is handled by the logistics partner, whose contact details are provided in the order confirmation. Any claim must be submitted within a reasonable time following receipt of the order.
              </Paragraph>
            </Section>

            <Section>
              <SectionTitle>Article 8 — Governing Law and Disputes</SectionTitle>
              <Paragraph>
                These terms are governed by French law. In the event of a dispute, an amicable resolution will be sought first. Failing that, the courts of Paris shall have exclusive jurisdiction.
              </Paragraph>
            </Section>
          </>
        )}
      </Content>
    </PageContainer>
  )
}

export default TermsOfSale
