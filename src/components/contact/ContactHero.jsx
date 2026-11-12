import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './ContactHero.css';

const ContactHero = () => {
  return (
    <section className="contact-hero">
      <div className="contact-hero-content">
        <motion.span 
          className="contact-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AURA CUSTOMER CARE
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          We'd Love to<br />Hear From You.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Whether you have a question about an order, need help finding the perfect piece, or simply want to connect with us, we're here to make your AURA experience exceptional.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <a href="#contact-form" className="btn-primary">
            Get In Touch <FiArrowRight />
          </a>
        </motion.div>
      </div>

      <motion.div 
        className="contact-hero-image"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop" 
          alt="Contact AURA" 
        />
      </motion.div>
    </section>
  );
};

export default ContactHero;