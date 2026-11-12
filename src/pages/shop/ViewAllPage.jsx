import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiFilter } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import ProductFilters from '../../components/shop/ProductFilters';
import MobileFilterDrawer from '../../components/shop/MobileFilterDrawer';
import CustomDropdown from '../../components/shop/CustomDropdown';
import { useStoreProducts } from '../../hooks/useStoreProducts'; // <-- IMPORT HOOK
import { useProductFilters } from '../../hooks/useProductFilters';
import './ViewAllPage.css';

const ViewAllPage = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // GET LIVE DB PRODUCTS
  const { products, loading } = useStoreProducts();

  // Configuration for the View All page
  const config = {
    title: "All Products",
    description: "Explore the complete AURA collection.",
    subcategories: [
      { name: "Men", slug: "men" },
      { name: "Women", slug: "women" },
      { name: "Accessories", slug: "accessories" },
      { name: "Shoes", slug: "shoes" },
      { name: "Bags", slug: "bags" },
    ]
  };

  // Pass LIVE DB products into the filter hook
  const filters = useProductFilters(products, config);
  const { filteredAndSortedProducts, sortOption, setSortOption } = filters;

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "best-selling", label: "Best Selling" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name-az", label: "Name: A to Z" },
  ];

  return (
    <div className="category-page">
      <div className="category-breadcrumbs">
        <Link to="/">Home</Link>
        <FiChevronRight size={14} />
        <Link to="/shop">Shop</Link>
        <FiChevronRight size={14} />
        <span className="current">All Products</span>
      </div>

      <div className="category-header-simple">
        <h1>All Products</h1>
        <p>Explore our complete collection of timeless essentials and contemporary styles.</p>
      </div>

      <div className="category-layout">
        <ProductFilters config={config} filters={filters} />
        <MobileFilterDrawer 
          isOpen={isMobileDrawerOpen} 
          onClose={() => setIsMobileDrawerOpen(false)} 
          config={config} 
          filters={filters} 
        />

        <div className="category-products-area">
          <div className="category-toolbar">
            <span className="product-count">
              {loading ? "Loading..." : `${filteredAndSortedProducts.length} Products`}
            </span>
            
            <div className="toolbar-actions">
              <button className="mobile-filter-btn" onClick={() => setIsMobileDrawerOpen(true)}>
                <FiFilter /> Filters
              </button>
              <CustomDropdown options={sortOptions} value={sortOption} onChange={setSortOption} />
            </div>
          </div>

          <div className="category-products-grid">
            {loading ? (
              <p style={{ padding: '2rem' }}>Fetching live inventory...</p>
            ) : filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="empty-state">
                <h3>No products found</h3>
                <p>Try adjusting your filters to discover more AURA styles.</p>
                <button onClick={filters.clearAllFilters} className="btn-secondary" style={{ marginTop: '1rem' }}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllPage;