import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import SectionHeading from '../../components/common/SectionHeading';
import { categoryConfig } from '../../data/categoryConfig';
import { useStoreProducts } from '../../hooks/useStoreProducts'; // <-- LIVE DB
import './GenderLandingPage.css';

const GenderLandingPage = ({ genderOverride }) => {
  const params = useParams();
  const gender = genderOverride || params.gender; 
  const { products, loading } = useStoreProducts(); 
  
  const config = categoryConfig[gender];
  if (!config) return <div>Collection Not Found</div>;

  // Filter LIVE DB products
  const genderProducts = products.filter(p => {
    if (gender === 'all' || gender === 'new-arrivals' || gender === 'best-sellers') return true;
    return p.category === gender;
  });

  return (
    <div className="gender-landing-page">
      <section className="gender-hero">
        <div className="gender-hero-content">
          <span className="gender-eyebrow">{config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <div className="gender-hero-image">
          <img src={config.image} alt={config.title} />
        </div>
      </section>

      <section className="gender-products">
        <SectionHeading eyebrow="CURATED FOR YOU" title={`Featured ${gender} Styles`} />
        
        {loading ? (
           <p style={{ padding: '2rem' }}>Loading...</p>
        ) : (
          <div className="product-grid">
            {genderProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default GenderLandingPage;