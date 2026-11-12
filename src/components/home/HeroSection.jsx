import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { heroCampaign } from '../../data/heroData';
import './HeroSection.css';

const HeroSection = () => {
  // Animation variants for text staggering
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="hero-section">
      
      {/* LEFT: Text Content */}
      <motion.div 
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span className="hero-eyebrow" variants={itemVariants}>
          {heroCampaign.eyebrow}
        </motion.span>
        
        <motion.h1 className="hero-title" variants={itemVariants}>
          {heroCampaign.titleLine1}<br />
          <span className="italic">{heroCampaign.titleLine2}</span>
        </motion.h1>
        
        <motion.p className="hero-description" variants={itemVariants}>
          {heroCampaign.description}
        </motion.p>
        
        <motion.div className="hero-ctas" variants={itemVariants}>
          <Link to={heroCampaign.primaryCta.link} className="btn-primary">
            {heroCampaign.primaryCta.text} <FiArrowRight />
          </Link>
          <Link to={heroCampaign.secondaryCta.link} className="btn-secondary">
            {heroCampaign.secondaryCta.text} <FiArrowRight />
          </Link>
        </motion.div>
      </motion.div>

      {/* RIGHT: Image Content */}
      <div className="hero-image-wrapper">
        <motion.img 
          src={heroCampaign.image} 
          alt="AURA New Collection" 
          className="hero-img"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        />
        
        {/* Floating Trust Badge */}
        <motion.div 
          className="premium-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        >
          <span className="star"><FiStar fill="currentColor" /></span>
          <div>
            <strong>Premium Quality</strong>
            <span>Trusted by Fashion Lovers</span>
          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default HeroSection;