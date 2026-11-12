import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ShopHero from '../../components/shop/ShopHero';
import ProductCard from '../../components/product/ProductCard';
import SectionHeading from '../../components/common/SectionHeading';
import { shopCategories } from '../../data/shopData'; // (Keep categories as fallback, but products are live)
import { useStoreProducts } from '../../hooks/useStoreProducts'; 
import './ShopPage.css';

const ShopPage = () => {
  const { products, loading } = useStoreProducts(); // <-- LIVE DB

  return (
    <div className="shop-page-wrapper">
      <ShopHero 
        title="Discover The AURA Collection" 
        description="Explore timeless essentials and contemporary styles designed for every moment."
        image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
      />

      <div className="shop-content-container">
        <motion.section className="shop-category-section" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <SectionHeading eyebrow="EXPLORE" title="Shop by Category" align="center" />
          <div className="shop-category-grid">
            {shopCategories.map((cat) => (
              <Link to={cat.link} className="category-card" key={cat.id}>
                <div className="category-card-img">
                  <img src={cat.image} alt={cat.name} />
                </div>
                <h3>{cat.name}</h3>
              </Link>
            ))}
          </div>
        </motion.section>

        <section className="shop-featured-section">
          <SectionHeading eyebrow="CURATED FOR YOU" title="Featured Products" description="Hand-picked pieces from our latest collections." />
          
          {loading ? (
             <p style={{ textAlign: 'center', padding: '3rem' }}>Loading live collection...</p>
          ) : (
            <div className="product-grid">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {products.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>No products added yet.</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShopPage;