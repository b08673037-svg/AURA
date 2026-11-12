import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import { useStoreProducts } from '../hooks/useStoreProducts'; // <-- IMPORT HOOK
import './SearchPage.css';

const SearchPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  
  const { products, loading } = useStoreProducts(); // <-- GET LIVE PRODUCTS
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim() && products.length > 0) {
      const searchLower = query.toLowerCase();
      const matched = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
      setResults(matched);
    } else {
      setResults([]);
    }
  }, [query, products]);

  return (
    <div className="search-page-wrapper">
      <div className="search-header">
        <h1>Search Results</h1>
        <p>Showing results for: <strong>"{query}"</strong></p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Searching our collections...</p>
      ) : results.length > 0 ? (
        <>
          <p className="results-count">{results.length} products found</p>
          <div className="product-grid">
            {results.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-search-state">
          <FiSearch size={48} className="empty-icon" />
          <h2>No products found</h2>
          <p>We couldn't find anything matching your search. Try a different keyword.</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
            Browse All Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchPage;