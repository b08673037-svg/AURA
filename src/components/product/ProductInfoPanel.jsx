import { useState } from 'react';
import { FiHeart, FiShoppingBag, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { ColorSelector, SizeSelector, QuantitySelector } from './ProductSelectors';
import ProductAccordion from './ProductAccordion';
import ConfirmModal from '../common/ConfirmModal';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';
import './ProductInfoPanel.css';

const ProductInfoPanel = ({ product }) => {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const formatPrice = (price) => `PKR ${price.toLocaleString()}`;
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : null;

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) return toast.error("Please select a size.");
    if (product.colors && product.colors.length > 0 && !selectedColor) return toast.error("Please select a color.");

    addToCart(product, quantity, selectedSize, selectedColor);
  };

  return (
    <div className="product-info-panel">
      <span className="product-category-label">{product.category} COLLECTION</span>
      <h1 className="product-title">{product.name}</h1>
      
      <div className="product-price-row">
        <span className="current-price">{formatPrice(product.price)}</span>
        {product.originalPrice && (
          <>
            <span className="original-price">{formatPrice(product.originalPrice)}</span>
            <span className="discount-badge">Save {discountPercent}%</span>
          </>
        )}
      </div>

      <p className="product-short-desc">{product.description}</p>

      {/* ONLY SHOW IF COLORS EXIST IN DB */}
      {product.colors && product.colors.length > 0 && (
        <ColorSelector 
          colors={product.colors} 
          selectedColor={selectedColor} 
          onChange={setSelectedColor} 
        />
      )}

      {/* ONLY SHOW IF SIZES EXIST IN DB */}
      {product.sizes && product.sizes.length > 0 && (
        <SizeSelector 
          sizes={product.sizes} 
          selectedSize={selectedSize} 
          onChange={setSelectedSize} 
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        />
      )}

      <div className="purchase-controls">
        <QuantitySelector quantity={quantity} onChange={setQuantity} maxStock={product.stock || 10} />
        
        <button className="btn-primary add-to-cart-btn-main" onClick={handleAddToCart}>
          ADD TO CART <FiShoppingBag />
        </button>
        
        <button className={`wishlist-btn-large ${isWishlisted ? 'active' : ''}`} onClick={() => toggleWishlist(product)}>
          <FiHeart fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="trust-indicators">
        <div className="trust-item"><FiTruck /> <span>Free Delivery over PKR 5,000</span></div>
        <div className="trust-item"><FiShield /> <span>Secure Checkout</span></div>
        <div className="trust-item"><FiRefreshCw /> <span>14-Day Easy Returns</span></div>
      </div>

      <div className="product-accordions">
        <ProductAccordion title="Description">
          <p>{product.description || "No detailed description available."}</p>
        </ProductAccordion>
        <ProductAccordion title="Product Details">
          <ul>
            <li><strong>Material:</strong> {product.material || "Premium Fabric Blend"}</li>
            <li><strong>Fit:</strong> {product.fit || "Regular Fit"}</li>
            <li><strong>Care:</strong> {product.careInstructions || "Dry clean only."}</li>
          </ul>
        </ProductAccordion>
      </div>

      <ConfirmModal 
        isOpen={isSizeGuideOpen}
        title="Size Guide"
        message="Our sizes are designed to fit true to standard measurements. If you are between sizes, we recommend sizing up for a relaxed fit."
        confirmText="Got it"
        onConfirm={() => setIsSizeGuideOpen(false)}
        onCancel={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
};

export default ProductInfoPanel;