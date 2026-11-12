import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ProductFilters from './ProductFilters';
import './MobileFilterDrawer.css';

const MobileFilterDrawer = ({ isOpen, onClose, config, filters }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="drawer-header">
              <h3>Filters</h3>
              <button className="drawer-close-btn" onClick={onClose}>
                <FiX size={24} />
              </button>
            </div>

            <div className="drawer-content">
              <ProductFilters config={config} filters={filters} />
            </div>

            <div className="drawer-footer">
              <button className="clear-btn" onClick={filters.clearAllFilters}>
                Clear All
              </button>
              <button className="apply-btn" onClick={onClose}>
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileFilterDrawer;