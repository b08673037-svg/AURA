import { useParams, Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ProductCard from '../../components/product/ProductCard';
import { getCollectionBySlug } from '../../data/collectionData';
import { shopProducts } from '../../data/shopData';
import './CollectionDetailsPage.css';

const CollectionDetailsPage = () => {
  const { slug } = useParams();
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return (
      <div className="collection-not-found-page">
        <h2>Collection Not Found</h2>
        <p>We couldn't find the collection you were looking for.</p>
        <Link to="/collections" className="btn-primary">Back to Collections</Link>
      </div>
    );
  }

  const collectionProducts = shopProducts.filter(
    p => p.collection === collection.slug
  );

  return (
    <div className="collection-details-wrapper">
      <div className="collection-breadcrumbs">
        <Link to="/">Home</Link>
        <FiChevronRight size={14} />
        <Link to="/collections">Collections</Link>
        <FiChevronRight size={14} />
        <span className="current">{collection.title}</span>
      </div>

      <motion.div 
        className="collection-hero-banner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="collection-hero-text">
          <span className="collection-hero-eyebrow">{collection.eyebrow}</span>
          <h1>{collection.title}</h1>
          <p>{collection.description}</p>
        </div>
        <div className="collection-hero-image">
          <img src={collection.image} alt={collection.title} />
        </div>
      </motion.div>

      <div className="collection-products-section">
        <div className="collection-products-header">
          <span className="product-count">{collectionProducts.length} Products</span>
        </div>

        {collectionProducts.length > 0 ? (
          <div className="collection-products-grid">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-collection-state">
            <h3>Restocking Soon</h3>
            <p>We are currently curating new pieces for this collection. Please check back later for new arrivals.</p>
            <Link to="/collections" className="btn-primary">
              Explore Other Collections
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetailsPage;