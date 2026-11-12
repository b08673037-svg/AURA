import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './CollectionsHero.css';

const CollectionsHero = () => {
  return (
    <div className="collections-hero">
      <div className="collections-hero-content">
        <motion.span 
          className="col-hero-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          CURATED FOR YOUR STYLE
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          The AURA Collections
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover thoughtfully curated edits, timeless essentials, and contemporary styles designed to make every moment your own.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a href="#explore-collections" className="btn-primary">
            Explore Collections <FiArrowRight />
          </a>
        </motion.div>
      </div>

      <motion.div 
        className="collections-hero-image"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" 
          alt="AURA Collections" 
        />
      </motion.div>
    </div>
  );
};

export default CollectionsHero;