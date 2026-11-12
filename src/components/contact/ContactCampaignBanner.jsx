import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './ContactCampaignBanner.css';

const ContactCampaignBanner = () => {
  return (
    <section className="contact-campaign-banner">
      <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop" alt="AURA" className="banner-img" />
      <div className="banner-overlay"></div>
      <div className="banner-content">
        <span className="banner-eyebrow">THE AURA EXPERIENCE</span>
        <h2>Your Experience Matters.</h2>
        <p>From the first discovery to the moment your order arrives, we're here to make every interaction feel effortless.</p>
        <Link to="/collections" className="btn-primary">
          Explore AURA <FiArrowRight />
        </Link>
      </div>
    </section>
  );
};

export default ContactCampaignBanner;