import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { supportCategories } from '../../data/contactData';
import './SupportCategories.css';

const SupportCategories = () => {
  return (
    <section className="support-section">
      <div className="support-container">
        <div className="support-header">
          <h2>How Can We Help?</h2>
          <p>Find the assistance you need and get back to enjoying your AURA experience.</p>
        </div>

        <div className="support-grid">
          {supportCategories.map((item, index) => (
            <motion.a 
              href={item.link}
              key={index} 
              className="support-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <span className="support-num">{item.num}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="support-cta">{item.cta} <FiArrowRight /></span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportCategories;