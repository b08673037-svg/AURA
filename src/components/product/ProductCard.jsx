import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useQuickView } from '../../context/QuickViewContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { openQuickView } = useQuickView();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = product.price || 0;
  const originalPrice = product.originalPrice || null;
  const formatPrice = (price) => typeof price === 'number' ? `PKR ${price.toLocaleString()}` : "PKR 0";

  const productLink = `/product/${product.slug || product.id}`;
  const mainImage = product.images?.[0] || product.image || "https://via.placeholder.com/400x500?text=No+Image";
  const hoverImage = product.hoverImage || (product.images && product.images.length > 1 ? product.images[1] : null);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if variants exist. If they do, open quick view. If not, add directly.
    const hasVariants = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0);

    if (hasVariants) {
      openQuickView(product);
    } else {
      addToCart(product, 1, "One Size", "Default");
      toast.success(`${product.name} added to bag!`);
    }
  };

  return (
    <motion.div 
      className="product-card" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link to={productLink} className="product-image-wrapper">
        {product.stock <= 5 && product.stock > 0 && (
          <span className="product-badge badge-hot">Low Stock</span>
        )}
        {product.stock === 0 && (
          <span className="product-badge badge-discount">Sold Out</span>
        )}
        
        <img 
          src={isHovered && hoverImage ? hoverImage : mainImage} 
          alt={product.name} 
          className={`product-img ${isHovered ? 'zoomed' : ''}`}
        />
        
        <div className={`product-actions ${isHovered ? 'visible' : ''}`}>
          <button 
            type="button"
            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
          >
            <FiHeart fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          
          <button 
            type="button"
            className="quick-view-btn"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
          >
            Quick View
          </button>
        </div>
      </Link>

      <div className="product-info">
        <div className="product-text">
          <span className="product-category-label">{product.category || "Collection"}</span>
          <Link to={productLink} className="product-title">{product.name || "AURA Product"}</Link>
          
          <div className="product-prices">
            <span className="price-current">{formatPrice(currentPrice)}</span>
            {originalPrice && (
              <span className="price-original">{formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>
        
        <button 
          type="button"
          className="add-to-cart-btn" 
          onClick={handleQuickAdd}
          aria-label="Add to cart"
        >
          <FiShoppingBag />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;