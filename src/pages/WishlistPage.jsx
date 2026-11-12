import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useQuickView } from '../context/QuickViewContext';
import ProductCard from '../components/product/ProductCard';
import ConfirmModal from '../components/common/ConfirmModal';
import { shopProducts } from '../data/shopData';
import './WishlistPage.css';

const WishlistPage = () => {
  const { wishlistItems, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { openQuickView } = useQuickView();
  
  const [sortOption, setSortOption] = useState("recent");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const formatPrice = (price) => `PKR ${price.toLocaleString()}`;

  let displayedItems = [...wishlistItems];
  if (filterCategory !== "all") {
    displayedItems = displayedItems.filter(item => item.category === filterCategory);
  }
  if (sortOption === "price-low") displayedItems.sort((a, b) => a.price - b.price);
  else if (sortOption === "price-high") displayedItems.sort((a, b) => b.price - a.price);
  else if (sortOption === "name-az") displayedItems.sort((a, b) => a.name.localeCompare(b.name));

  const recommendations = shopProducts
    .filter(p => !wishlistItems.some(w => w.id === p.id))
    .slice(0, 4);

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-empty-page">
        <div className="wishlist-empty-content">
          <span className="wishlist-eyebrow">YOUR PERSONAL EDIT</span>
          <h1>A Little Room for Something You Love.</h1>
          <p>Your wishlist is waiting for its first favourite. Explore the AURA collections and save the pieces that feel like you.</p>
          <Link to="/collections" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Explore Collections <FiArrowRight />
          </Link>
        </div>
        <div className="wishlist-recommendations">
          <h2>You May Also Love</h2>
          <div className="product-grid">
            {recommendations.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page-wrapper">
      <div className="wishlist-hero">
        <span className="wishlist-eyebrow">YOUR PERSONAL EDIT</span>
        <h1>The Pieces You Love.</h1>
        <p>Your favourite AURA pieces, thoughtfully saved in one place. Revisit the styles that speak to you whenever you're ready.</p>
        <div className="wishlist-stats">
          <span>{wishlistCount} Saved Items</span>
          <Link to="/shop" className="continue-shopping">Continue Shopping →</Link>
        </div>
      </div>

      <div className="wishlist-toolbar">
        <div className="toolbar-left">
          <h2>Saved Items</h2>
          <span className="item-count">({displayedItems.length})</span>
        </div>
        <div className="toolbar-right">
          <select className="wishlist-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="accessories">Accessories</option>
            <option value="shoes">Shoes</option>
            <option value="bags">Bags</option>
          </select>
          <select className="wishlist-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="recent">Recently Added</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-az">Name: A to Z</option>
          </select>
          <button className="clear-wishlist-btn" onClick={() => setIsClearModalOpen(true)}>Clear All</button>
        </div>
      </div>

      <div className="wishlist-grid">
        <AnimatePresence>
          {displayedItems.map(item => (
            <motion.div key={item.id} className="wishlist-item-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
              <div className="wishlist-item-image">
                <img src={item.images?.[0] || item.image} alt={item.name} />
                <button className="remove-wishlist-btn" onClick={() => removeFromWishlist(item.id)} aria-label="Remove">
                  <FiTrash2 />
                </button>
              </div>
              <div className="wishlist-item-info">
                <span className="wishlist-item-category">{item.category}</span>
                <Link to={`/product/${item.slug || item.id}`} className="wishlist-item-name">{item.name}</Link>
                <span className="wishlist-item-price">{formatPrice(item.price)}</span>
                <div className="wishlist-item-actions">
                  <button className="btn-primary add-to-bag-btn" onClick={() => openQuickView(item)}>Add to Bag <FiShoppingBag /></button>
                  <button className="quick-view-link" onClick={() => openQuickView(item)}>Quick View</button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="wishlist-recommendations">
        <h2>You May Also Love</h2>
        <p>Discover more pieces selected to complement your personal style.</p>
        <div className="product-grid">
          {recommendations.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>

      <ConfirmModal 
        isOpen={isClearModalOpen}
        title="Clear Wishlist?"
        message="Are you sure you want to remove all items from your wishlist? This action cannot be undone."
        confirmText="Yes, Clear All"
        isDestructive={true}
        onConfirm={clearWishlist}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};

export default WishlistPage;