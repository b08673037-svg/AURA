import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiShoppingBag, FiHeart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuickView } from '../../context/QuickViewContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { ColorSelector, SizeSelector, QuantitySelector } from './ProductSelectors';
import toast from 'react-hot-toast';
import './QuickViewModal.css';

const QuickViewModal = () => {
  const { isOpen, selectedProduct, closeQuickView } = useQuickView();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [activeImage, setActiveImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (selectedProduct) {
      const images = selectedProduct.images || (selectedProduct.image ? [selectedProduct.image] : []);
      setActiveImage(images[0] || null);
      setSelectedColor(selectedProduct.colors?.[0] || null);
      setSelectedSize(null);
      setQuantity(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProduct]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) closeQuickView();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeQuickView]);

  if (!selectedProduct) return null;

  const productImages = selectedProduct.images || (selectedProduct.image ? [selectedProduct.image] : []);
  const formatPrice = (price) => `PKR ${price.toLocaleString()}`;
  const discountPercent = selectedProduct.originalPrice 
    ? Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100) 
    : null;

  const handleAddToCart = () => {
    if (selectedProduct.sizes && !selectedSize) return toast.error("Please select a size.");
    if (selectedProduct.colors && !selectedColor) return toast.error("Please select a color.");

    // Just add to cart. No popup. Navbar updates automatically.
    addToCart(selectedProduct, quantity, selectedSize, selectedColor);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="qv-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeQuickView} />

          <div className="qv-modal-wrapper">
            <motion.div className="qv-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }}>
              <button className="qv-close-btn" onClick={closeQuickView}><FiX size={24} /></button>

              <div className="qv-gallery">
                <div className="qv-main-image">
                  {activeImage ? <img src={activeImage} alt={selectedProduct.name} /> : <div className="qv-no-image">No Image</div>}
                </div>
                {productImages.length > 1 && (
                  <div className="qv-thumbnails">
                    {productImages.map((img, idx) => (
                      <button key={idx} className={`qv-thumb ${activeImage === img ? 'active' : ''}`} onClick={() => setActiveImage(img)}>
                        <img src={img} alt={`Thumb ${idx}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="qv-info">
                <span className="qv-category">{selectedProduct.category} COLLECTION</span>
                <h2 className="qv-title">{selectedProduct.name}</h2>
                
                <div className="qv-price-row">
                  <span className="qv-current-price">{formatPrice(selectedProduct.price)}</span>
                  {selectedProduct.originalPrice && (
                    <>
                      <span className="qv-original-price">{formatPrice(selectedProduct.originalPrice)}</span>
                      <span className="qv-discount">{discountPercent}% OFF</span>
                    </>
                  )}
                </div>

                <p className="qv-desc">{selectedProduct.description || "A refined essential."}</p>

                <div className="qv-selectors">
                  {selectedProduct.colors && <ColorSelector colors={selectedProduct.colors} selectedColor={selectedColor} onChange={setSelectedColor} />}
                  {selectedProduct.sizes && <SizeSelector sizes={selectedProduct.sizes} selectedSize={selectedSize} onChange={setSelectedSize} onOpenSizeGuide={() => toast("Size Guide")} />}
                </div>

                <div className="qv-actions">
                  <QuantitySelector quantity={quantity} onChange={setQuantity} maxStock={10} />
                  <button className="qv-add-btn" onClick={handleAddToCart}>
                    ADD TO CART <FiShoppingBag />
                  </button>
                  <button className={`qv-wishlist-btn ${isInWishlist(selectedProduct.id) ? 'active' : ''}`} onClick={() => toggleWishlist(selectedProduct)}>
                    <FiHeart fill={isInWishlist(selectedProduct.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                <Link to={`/product/${selectedProduct.slug || selectedProduct.id}`} className="qv-full-details" onClick={closeQuickView}>
                  View Full Details →
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;