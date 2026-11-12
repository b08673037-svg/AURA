import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiStar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials } from '../../data/testimonialData';
import SectionHeading from '../common/SectionHeading';
import './Testimonials.css';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-slide logic
  useEffect(() => {
    if (isHovered) return; // Pause on hover

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 6000); // 6 seconds

    return () => clearInterval(timer);
  }, [isHovered]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const activeTestimonial = testimonials[currentIndex];

  return (
    <section className="section-container testimonials-section">
      <SectionHeading 
        eyebrow="WHAT OUR CUSTOMERS SAY" 
        title="The AURA Experience" 
        description="Style is personal. Here's what our customers have to say about their experience with AURA."
        align="center"
      />

      <div 
        className="slider-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navigation Arrows */}
        <button className="slider-arrow left" onClick={handlePrev} aria-label="Previous review">
          <FiChevronLeft size={24} />
        </button>
        <button className="slider-arrow right" onClick={handleNext} aria-label="Next review">
          <FiChevronRight size={24} />
        </button>

        {/* Slider Content */}
        <div className="slider-content-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="testimonial-card"
            >
              <div className="quote-mark">"</div>
              
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    fill={i < activeTestimonial.rating ? "var(--accent-burgundy)" : "none"} 
                    stroke="var(--accent-burgundy)" 
                  />
                ))}
              </div>

              <p className="review-text">"{activeTestimonial.review}"</p>

              <div className="customer-info">
                <img 
                  src={activeTestimonial.customerAvatar} 
                  alt={activeTestimonial.customerName} 
                  className="customer-avatar" 
                />
                <div className="customer-details">
                  <strong>{activeTestimonial.customerName}</strong>
                  <span className="product-name">Purchased: {activeTestimonial.productName}</span>
                  {activeTestimonial.verifiedPurchase && (
                    <span className="verified-badge">
                      <FiCheckCircle size={12} /> Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="slider-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;