import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductGallery.css';

const ProductGallery = ({ images }) => {
  const [activeImage, setActiveImage] = useState(images[0]);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="product-gallery-premium">
      
      {/* Main Image View */}
      <div 
        className={`gallery-main-view ${isZoomed ? 'zoomed' : ''}`}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt="Product"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="main-img"
          />
        </AnimatePresence>
      </div>

      {/* Vertical Thumbnail Strip */}
      <div className="gallery-thumbnails">
        {images.map((img, index) => (
          <button 
            key={index} 
            className={`thumb-btn ${activeImage === img ? 'active' : ''}`}
            onClick={() => setActiveImage(img)}
          >
            <img src={img} alt={`Thumbnail ${index + 1}`} />
          </button>
        ))}
      </div>
      
    </div>
  );
};

export default ProductGallery;