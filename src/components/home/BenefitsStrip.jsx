import { FiTruck, FiShield, FiHeadphones, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './BenefitsStrip.css';

const BenefitsStrip = () => {
  const benefits = [
    { icon: <FiTruck />, title: "Free Shipping", subtitle: "On orders over PKR 5,000" },
    { icon: <FiShield />, title: "Secure Payments", subtitle: "Your data is safe" },
    { icon: <FiHeadphones />, title: "24/7 Support", subtitle: "Always here to help" },
    { icon: <FiRefreshCw />, title: "Easy Returns", subtitle: "Hassle-free returns" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="benefits-wrapper">
      <motion.div 
        className="benefits-strip"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {benefits.map((benefit, index) => (
          <motion.div 
            key={index} 
            className="benefit-item"
            variants={itemVariants}
            whileHover={{ y: -3 }} 
          >
            <span className="benefit-icon">{benefit.icon}</span>
            <div className="benefit-text">
              <strong>{benefit.title}</strong>
              <span>{benefit.subtitle}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default BenefitsStrip;