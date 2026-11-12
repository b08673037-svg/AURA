import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './LookProduct.css';

const LookProduct = ({ product, campaignCategory, onOpen }) => {
  // Generate a safe slug. If the product has a slug, use it.
  // Otherwise, generate one based on the name (e.g., "Premium Charcoal Overshirt" -> "premium-charcoal-overshirt")
  const productSlug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <motion.div 
      className="look-product-row"
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/product/${productSlug}`} className="look-product-img">
        <img src={product.image} alt={product.name} />
      </Link>
      
      <div className="look-product-info">
        <Link to={`/product/${productSlug}`} className="look-product-name">
          {product.name}
        </Link>
        <span className="look-product-price">PKR {product.price.toLocaleString()}</span>
      </div>
      
      <motion.button 
        className="look-add-btn" 
        aria-label="Add to cart"
        onClick={() => onOpen(product, campaignCategory)}
        whileHover={{ scale: 1.05, backgroundColor: "var(--accent-burgundy)", color: "var(--white)" }}
        whileTap={{ scale: 0.95 }}
      >
        <FiShoppingBag />
      </motion.button>
    </motion.div>
  );
};

export default LookProduct;