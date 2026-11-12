import ContactHero from '../components/contact/ContactHero';
import ContactMain from '../components/contact/ContactMain';
import SupportCategories from '../components/contact/SupportCategories';
import ContactCampaignBanner from '../components/contact/ContactCampaignBanner';
import ContactFAQ from '../components/contact/ContactFAQ';

const ContactPage = () => {
  return (
    <div className="contact-page-wrapper" style={{ overflowX: 'hidden', width: '100%' }}>
      <ContactHero />
      <ContactMain />
      <SupportCategories />
      <ContactCampaignBanner />
      <ContactFAQ />
    </div>
  );
};

export default ContactPage;