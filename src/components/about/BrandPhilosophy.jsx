import { motion } from 'framer-motion';
import './BrandPhilosophy.css';

const BrandPhilosophy = () => {
  return (
    <section className="philosophy-section">
      <div className="philosophy-container">
        <motion.span 
          className="philosophy-label"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          THE AURA PHILOSOPHY
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Fashion Fades.<br />
          <span className="italic">Personal Style Remains.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          We look beyond passing trends to celebrate the pieces, details, and expressions that make personal style truly meaningful.
        </motion.p>
      </div>
    </section>
  );
};

export default BrandPhilosophy;