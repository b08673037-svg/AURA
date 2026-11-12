import HeroSection from '../../components/home/HeroSection';
import CategoryNavigation from '../../components/home/CategoryNavigation';
import SectionHeading from '../../components/common/SectionHeading';
import ProductCard from '../../components/product/ProductCard';
import CollectionBanner from '../../components/home/CollectionBanner';
import ShopTheLook from '../../components/shop-the-look/ShopTheLook'; 
import BrandStory from '../../components/home/BrandStory'; 
import Testimonials from '../../components/home/Testimonials'; 
import BenefitsStrip from '../../components/home/BenefitsStrip';

import { collectionsData } from '../../data/homeData';
import { useStoreProducts } from '../../hooks/useStoreProducts';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion'; 
import './Home.css';

const Home = () => {
  const { products, loading } = useStoreProducts();
  
  // CHANGED: Slice to exactly 4 products for the homepage
  const newArrivals = products.slice(0, 4);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="home-page">
      <HeroSection />
      <CategoryNavigation />

      {/* NEW ARRIVALS */}
      <section className="section-container new-arrivals-section">
        <div className="arrivals-layout">
          <motion.div 
            className="arrivals-intro"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <SectionHeading 
              eyebrow="NEW ARRIVALS" 
              title={<>Fresh Styles<br/>Just for You</>}
              description="Explore our latest collection and stay ahead in fashion."
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ display: 'inline-block', marginTop: '1.5rem' }}
            >
              <Link to="/shop/all" className="btn-primary">
                View All Products <FiArrowRight />
              </Link>
            </motion.div>
          </motion.div>

          {loading ? (
            <p style={{ padding: '2rem' }}>Loading collection...</p>
          ) : newArrivals.length > 0 ? (
            <motion.div 
              className="arrivals-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {/* Renders exactly 4 products now */}
              {newArrivals.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p style={{ padding: '2rem', color: '#666' }}>No products added to the database yet.</p>
          )}
        </div>
      </section>

      {/* COLLECTION BANNERS */}
      <motion.section 
        className="section-container collection-banners-section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <CollectionBanner {...collectionsData.men} theme="dark" />
        <CollectionBanner {...collectionsData.women} theme="light" />
      </motion.section>

      <ShopTheLook />
      <BrandStory />
      <Testimonials />
      <BenefitsStrip />
    </div>
  );
};

export default Home;