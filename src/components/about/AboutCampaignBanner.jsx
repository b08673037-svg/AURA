import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AboutCampaignBanner.css';

const AboutCampaignBanner = () => {
  return (
    <section className="about-final-banner">
      <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop" alt="Campaign" className="banner-bg" />
      <div className="banner-overlay"></div>
      <motion.div 
        className="banner-content"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Timeless Style.<br/>Everyday Confidence.</h2>
        <p>Discover a style that feels unmistakably yours.</p>
        <Link to="/collections" className="btn-primary">
          Explore The Collection
        </Link>
      </motion.div>
    </section>
  );
};

export default AboutCampaignBanner;