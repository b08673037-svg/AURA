import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { FiChevronRight, FiFilter, FiArrowRight } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import ProductFilters from '../../components/shop/ProductFilters';
import MobileFilterDrawer from '../../components/shop/MobileFilterDrawer';
import CustomDropdown from '../../components/shop/CustomDropdown';
import { categoryConfig } from '../../data/categoryConfig';
import { useStoreProducts } from '../../hooks/useStoreProducts';
import { useProductFilters } from '../../hooks/useProductFilters';
import './CategoryListingPage.css';

const CategoryListingPage = () => {
  const { gender, category } = useParams();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  const { products, loading } = useStoreProducts();

  // If they go to a subcategory that doesn't exist, redirect to the main category
  const config = categoryConfig[`${gender}/${category}`] || categoryConfig[gender];

  if (!config) {
    return <Navigate to="/shop" replace />;
  }

  // Filter DB products
  const baseProducts = products.filter(product => {
    if (category && product.category !== category) return product.category === gender;
    return product.category === gender;
  });

  const filters = useProductFilters(baseProducts, config);
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
        <Link to={`/shop/${gender}`}>{gender}</Link>
        {category && (
          <>
            <FiChevronRight size={14} />
            <span className="current">{category}</span>
          </>
        )}
      </div>

      <div className="category-header-simple">
        <h1>{config.title}</h1>
        <p>{config.description}</p>
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
              <button 
                className="mobile-filter-btn"
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                <FiFilter /> Filters
              </button>
              
              <CustomDropdown 
                options={sortOptions}
                value={sortOption}
                onChange={setSortOption}
              />
            </div>
          </div>

          <div className="category-products-grid">
            {loading ? (
              <p>Fetching collection...</p>
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

export default CategoryListingPage;