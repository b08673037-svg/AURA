import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiHeart, FiShoppingBag, FiMinus, FiPlus, FiArrowRight, FiTag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';
import { shopProducts } from '../data/shopData';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, savedItems, cartCount, subtotal, 
    coupon, discountAmount, finalTotal,
    removeFromCart, updateQuantity, saveForLater, moveToCart, removeSavedItem,
    applyCoupon, removeCoupon 
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  
  const formatPrice = (price) => `PKR ${price.toLocaleString()}`;
  const FREE_SHIPPING_THRESHOLD = 5000;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  // Get recommendations (products not in cart)
  const recommendations = shopProducts
    .filter(p => !cartItems.some(item => item.id === p.id))
    .slice(0, 4);

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-page">
        <div className="empty-cart-content">
          <span className="empty-eyebrow">YOUR AURA SELECTION</span>
          <h1>Your Bag Is Waiting.</h1>
          <p>Discover timeless pieces and find something that feels unmistakably yours.</p>
          <Link to="/collections" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Explore Collections <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      
      {/* HEADER */}
      <div className="cart-header-section">
        <div className="cart-header-text">
          <span className="cart-eyebrow">AURA / YOUR SELECTION</span>
          <h1>Your Shopping Bag</h1>
          <p>Thoughtfully selected pieces, ready to become part of your everyday style.</p>
          <div className="cart-stats">
            <span>{cartItems.length} Items</span>
            <span>{cartCount} Total Quantity</span>
            <Link to="/shop" className="continue-shopping">Continue Shopping →</Link>
          </div>
        </div>

        <div className="cart-progress">
          <div className="progress-step active"><span>01</span> BAG</div>
          <div className="progress-line"></div>
          <div className="progress-step"><span>02</span> DELIVERY</div>
          <div className="progress-line"></div>
          <div className="progress-step"><span>03</span> PAYMENT</div>
        </div>
      </div>

      <div className="cart-main-layout">
        
        {/* LEFT: Product List */}
        <div className="cart-products-col">
          
          {/* Free Shipping */}
          <div className="free-shipping-bar">
            {hasFreeShipping ? (
              <p className="free-shipping-success">Congratulations! You've unlocked free shipping.</p>
            ) : (
              <p>You're only <strong>{formatPrice(amountToFreeShipping)}</strong> away from free shipping!</p>
            )}
            <div className="progress-bar-bg">
              <motion.div 
                className="progress-bar-fill" 
                initial={{ width: 0 }}
                animate={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          <div className="cart-items-list">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div 
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="cart-item-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -50 }}
                >
                  <Link to={`/product/${item.slug}`} className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </Link>

                  <div className="cart-item-details">
                    <span className="item-category">{item.category}</span>
                    <Link to={`/product/${item.slug}`} className="item-name">{item.name}</Link>
                    <div className="item-variants">
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    </div>
                    <span className="item-price">{formatPrice(item.price)}</span>
                  </div>

                  <div className="cart-item-actions">
                    <div className="item-quantity">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}><FiMinus /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}><FiPlus /></button>
                    </div>
                    <span className="item-subtotal">{formatPrice(item.price * item.quantity)}</span>
                    
                    <div className="item-links">
                      <button onClick={() => saveForLater(item.id, item.selectedSize, item.selectedColor)}>
                        <FiHeart /> Save
                      </button>
                      <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}>
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className="cart-summary-col">
          <div className="order-summary-card">
            <h2>Order Summary</h2>
            
            {/* Coupon Section */}
            <div className="coupon-section">
              {coupon ? (
                <div className="applied-coupon">
                  <span><FiTag /> {coupon.code} applied</span>
                  <button onClick={removeCoupon}>Remove</button>
                </div>
              ) : (
                <div className="coupon-input-group">
                  <input 
                    type="text" 
                    placeholder="Promo Code" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button onClick={() => applyCoupon(couponInput)}>Apply</button>
                </div>
              )}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            {coupon && (
              <div className="summary-row discount">
                <span>Discount ({coupon.code})</span>
                <span>- {formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Shipping</span>
              <span>{hasFreeShipping ? "Free" : "Calculated at checkout"}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total-row">
              <span>Estimated Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>

            {/* UPDATED: Navigate to Checkout */}
            <button className="btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <FiArrowRight />
            </button>
          </div>
        </div>

      </div>

      {/* SAVED FOR LATER */}
      {savedItems.length > 0 && (
        <div className="saved-later-section">
          <h2>Saved for Later</h2>
          <p>Pieces you've loved, ready whenever you are.</p>
          <div className="saved-grid">
            {savedItems.map(item => (
              <div key={`${item.id}-${item.selectedSize}`} className="saved-item">
                <img src={item.image} alt={item.name} />
                <div className="saved-info">
                  <h4>{item.name}</h4>
                  <span>{formatPrice(item.price)}</span>
                </div>
                <div className="saved-actions">
                  <button onClick={() => moveToCart(item.id, item.selectedSize, item.selectedColor)}>Move to Bag</button>
                  <button onClick={() => removeSavedItem(item.id, item.selectedSize, item.selectedColor)}><FiTrash2 /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPLETE THE LOOK */}
      <div className="recommendations-section">
        <h2>Complete The Look</h2>
        <p>Discover pieces that complement your selection.</p>
        <div className="product-grid">
          {recommendations.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default CartPage;