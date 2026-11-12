import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { brandStory, brandValues } from '../../data/brandStoryData';
import './BrandStory.css';

const BrandStory = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <section className="brand-story-section">
      <div className="brand-story-container">
        
        {/* LEFT: Editorial Image */}
        <motion.div 
          className="story-image-wrapper"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <img src={brandStory.image} alt="AURA Philosophy" className="story-img" />
        </motion.div>

        {/* RIGHT: Text Content */}
        <motion.div 
          className="story-content"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.span className="story-eyebrow" variants={fadeInUp}>
            {brandStory.eyebrow}
          </motion.span>
          
          <motion.h2 className="story-title" variants={fadeInUp}>
            {brandStory.titleLine1}<br />
            <span className="italic">{brandStory.titleLine2}</span>
          </motion.h2>
          
          <motion.p className="story-description" variants={fadeInUp}>
            {brandStory.description}
          </motion.p>
          
          <motion.p className="story-supporting" variants={fadeInUp}>
            {brandStory.supportingText}
          </motion.p>
          
          <motion.div variants={fadeInUp}>
            <Link to={brandStory.ctaLink} className="btn-primary story-cta">
              {brandStory.ctaText} <FiArrowRight />
            </Link>
          </motion.div>
        </motion.div>

      </div>

      {/* BOTTOM: Brand Values Strip */}
      <motion.div 
        className="brand-values-strip"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        {brandValues.map((value, index) => (
          <motion.div 
            key={index} 
            className="brand-value-item"
            variants={fadeInUp}
          >
            <span className="value-number">{value.number}</span>
            <div className="value-text">
              <h4>{value.title}</h4>
              <p>{value.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default BrandStory;