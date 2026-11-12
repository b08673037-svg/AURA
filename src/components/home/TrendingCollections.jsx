import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { trendingCollectionsData } from '../../data/homeData';
import SectionHeading from '../common/SectionHeading';
import './TrendingCollections.css';

const TrendingCollections = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
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

  return (
    <section className="section-container trending-section">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <SectionHeading 
          eyebrow="CURATED FOR YOU" 
          title="Trending Collections" 
          description="Explore our most coveted edits of the season, designed to elevate your everyday wardrobe."
          align="center"
        />
      </motion.div>

      {/* Editorial Grid */}
      <motion.div 
        className="trending-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {trendingCollectionsData.map((col) => (
          <motion.div 
            key={col.id} 
            className={`trending-card ${col.isLarge ? 'large-card' : 'small-card'}`}
            variants={itemVariants}
          >
            <Link to={col.link} className="trending-img-wrapper">
              <motion.img 
                src={col.image} 
                alt={col.title} 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              
              {/* Overlay Content */}
              <div className="trending-overlay">
                <div className="trending-text">
                  <span className="trending-subtitle">{col.subtitle}</span>
                  <h3>{col.title}</h3>
                </div>
                <div className="trending-arrow">
                  <FiArrowRight />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default TrendingCollections;