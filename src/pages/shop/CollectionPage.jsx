import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../../components/product/ProductCard';
import { categoryConfig } from '../../data/categoryConfig'; // Correct Import
import { shopProducts } from '../../data/shopData';
import './CollectionPage.css';

const CollectionPage = () => {
  const location = useLocation();
  const collectionName = location.pathname.split('/').pop(); 
  
  // Look up the config in categoryConfig
  const config = categoryConfig[collectionName];

  if (!config) {
    return (
      <div className="collection-not-found">
        <h2>Collection Not Found</h2>
        <Link to="/shop" className="btn-primary">Return to Shop</Link>
      </div>
    );
  }

  // Filter products based on the collection name
  let filteredProducts = [];
  if (collectionName === 'new-arrivals') {
    filteredProducts = shopProducts.filter(p => p.isNew);
  } else {
    filteredProducts = shopProducts.filter(p => p.category === collectionName);
  }

  return (
    <div className="collection-page-wrapper">
      
      {/* 1. Editorial Hero */}
      <section className="collection-hero">
        <div className="collection-hero-content">
          <motion.span 
            className="collection-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {config.eyebrow}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {config.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {config.description}
          </motion.p>
        </div>
        <motion.div 
          className="collection-hero-image"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img src={config.image} alt={config.title} />
        </motion.div>
      </section>

      {/* 2. Product Grid */}
      <section className="collection-products-section">
        <div className="collection-products-header">
          <span className="product-count">{filteredProducts.length} Products</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>We are currently restocking this collection. Please check back later.</p>
            <Link to="/shop" className="btn-secondary" style={{ marginTop: '1.5rem' }}>
              Back to Shop
            </Link>
          </div>
        )}
      </section>

    </div>
  );
};

export default CollectionPage;