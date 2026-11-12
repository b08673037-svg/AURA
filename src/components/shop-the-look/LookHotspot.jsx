import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './LookHotspot.css';

const LookHotspot = ({ product, position, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Safe slug generation
  const productSlug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <div 
      className="hotspot-container" 
      style={{ top: position.top, left: position.left }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <motion.button 
        className={`hotspot-dot ${isOpen ? 'active' : ''}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiPlus />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hotspot-tooltip-wrapper"
          >
            <div className="hotspot-tooltip">
              <img src={product.image} alt={product.name} />
              <div className="hotspot-info">
                <span className="hotspot-name">{product.name}</span>
                <span className="hotspot-price">PKR {product.price.toLocaleString()}</span>
                <Link to={`/product/${productSlug}`} className="hotspot-link">
                  View Product <FiArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LookHotspot;