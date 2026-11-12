import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './AboutHero.css';

const AboutHero = () => {
  return (
    <section className="about-hero">
      <div className="about-hero-content">
        <motion.span 
          className="about-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          THE WORLD OF AURA
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1>
  Style Is More Than<br />
  What You Wear.
</h1>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          At AURA, we believe true style is an expression of confidence, individuality, and the little details that make every moment your own.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a href="#our-story" className="btn-primary">
            Discover Our Story <FiArrowRight />
          </a>
        </motion.div>
      </div>

      <motion.div 
        className="about-hero-image"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" 
          alt="AURA Editorial" 
        />
      </motion.div>
    </section>
  );
};

export default AboutHero;