import { motion } from 'framer-motion';
import './OurVision.css';

const OurVision = () => {
  return (
    <section className="our-vision-section">
      <motion.div 
        className="vision-image"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1000&auto=format&fit=crop" alt="Vision" />
      </motion.div>
      
      <motion.div 
        className="vision-text"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span className="vision-eyebrow">OUR VISION</span>
        <h2>Creating a More Personal Relationship With Style.</h2>
        <p>We envision a fashion experience where discovering your style feels effortless, inspiring, and personal.</p>
        <p>AURA continues to bring together contemporary fashion and timeless inspiration, creating a space where everyone can explore pieces that feel naturally their own.</p>
      </motion.div>
    </section>
  );
};

export default OurVision;