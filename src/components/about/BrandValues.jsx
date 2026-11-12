import { motion } from 'framer-motion';
import './BrandValues.css';

const BrandValues = () => {
  const values = [
    { num: "01", title: "Timeless Design", desc: "Style that feels relevant beyond seasonal trends." },
    { num: "02", title: "Everyday Confidence", desc: "Fashion that helps you feel comfortable and confident in your own expression." },
    { num: "03", title: "Personality & Individuality", desc: "Your style should reflect who you are, not simply what is trending." },
    { num: "04", title: "Thoughtful Selection", desc: "Collections brought together with attention to design, versatility, and detail." }
  ];

  return (
    <section className="brand-values-section">
      <div className="brand-values-container">
        
        <div className="values-header">
          <h2>What We Believe In</h2>
          <p>The principles behind every AURA collection.</p>
        </div>

        <div className="values-grid">
          {values.map((val, index) => (
            <motion.div 
              key={index} 
              className="value-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <span className="value-number">{val.num}</span>
              <h3>{val.title}</h3>
              <p>{val.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BrandValues;