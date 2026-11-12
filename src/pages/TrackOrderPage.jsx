import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiCheck, FiTruck, FiPackage, FiHome, FiX, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './TrackOrderPage.css';

const TrackOrderPage = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // This is mock data. We will connect this to Firebase in Phase 5.
  const mockOrder = {
    orderNumber: "AURA-84920",
    date: "October 24, 2026",
    status: "Shipped",
    estimatedDelivery: "October 28, 2026",
    timeline: [
      { status: "Order Placed", date: "Oct 24, 10:00 AM", isCompleted: true },
      { status: "Order Confirmed", date: "Oct 24, 11:30 AM", isCompleted: true },
      { status: "Processing", date: "Oct 25, 09:00 AM", isCompleted: true },
      { status: "Shipped", date: "Oct 26, 02:00 PM", isCompleted: true, isCurrent: true },
      { status: "Out for Delivery", date: "Pending", isCompleted: false },
      { status: "Delivered", date: "Pending", isCompleted: false },
    ],
    items: [
      { id: "sp1", name: "Premium Wool Overcoat", price: 14999, qty: 1, size: "M", image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=200&auto=format&fit=crop" },
      { id: "sp4", name: "Tailored Linen Shirt", price: 4499, qty: 2, size: "L", image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=200&auto=format&fit=crop" },
    ],
    subtotal: 23997,
    shipping: 0,
    total: 23997,
  };

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (!orderNumber || !contactInfo) {
      return toast.error("Please fill in all fields.");
    }

    setIsLoading(true);
    
    // Simulate Firebase request delay
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
      toast.success("Order found!");
    }, 1500);
  };

  const formatPrice = (price) => `PKR ${price.toLocaleString()}`;

  return (
    <div className="track-order-page">
      
      {/* HERO */}
      <section className="track-hero">
        <motion.span 
          className="track-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AURA ORDER CARE
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Your Order, Every Step of the Way.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          From our collection to your doorstep, follow your AURA order's journey with ease.
        </motion.p>
      </section>

      {/* MAIN CONTENT */}
      <div className="track-content-container">
        
        {/* FORM SECTION */}
        {!showResults && (
          <motion.div 
            className="track-form-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>Let's Find Your Order.</h2>
            <p>Enter your order details below to view the latest delivery updates.</p>
            
            <form onSubmit={handleTrackOrder} className="track-form">
              <div className="form-group">
                <label>Order Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. AURA-84920" 
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email Address or Phone Number</label>
                <input 
                  type="text" 
                  placeholder="Used during checkout" 
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary track-submit-btn" disabled={isLoading}>
                {isLoading ? "Searching..." : "Track My Order"} <FiSearch />
              </button>
            </form>
            
            <p className="track-help-text">Your order number can be found in your order confirmation email.</p>
            <Link to="/contact" className="track-help-link">Need help finding your order?</Link>
          </motion.div>
        )}

        {/* RESULTS DASHBOARD */}
        {showResults && (
          <motion.div 
            className="track-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="dashboard-header">
              <div>
                <span className="dashboard-eyebrow">ORDER #{mockOrder.orderNumber}</span>
                <h2>{mockOrder.status === "Shipped" ? "Your Order Is on Its Way." : `Order Status: ${mockOrder.status}`}</h2>
                <p>Placed on {mockOrder.date}</p>
              </div>
              <div className="status-badge">
                <FiTruck /> {mockOrder.status}
              </div>
            </div>

            <div className="dashboard-grid">
              {/* LEFT: TIMELINE */}
              <div className="timeline-col">
                <h3>Delivery Timeline</h3>
                <div className="timeline">
                  {mockOrder.timeline.map((step, index) => (
                    <div key={index} className={`timeline-item ${step.isCompleted ? 'completed' : ''} ${step.isCurrent ? 'current' : ''}`}>
                      <div className="timeline-icon">
                        {step.isCompleted ? <FiCheck /> : <div className="timeline-dot"></div>}
                      </div>
                      <div className="timeline-info">
                        <h4>{step.status}</h4>
                        <span>{step.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: ORDER DETAILS */}
              <div className="details-col">
                <div className="delivery-card">
                  <h3>Delivery Information</h3>
                  <p><strong>Estimated Delivery:</strong> {mockOrder.estimatedDelivery}</p>
                  <p><strong>Shipping Method:</strong> Standard Delivery</p>
                </div>

                <div className="items-card">
                  <h3>Your AURA Selection</h3>
                  {mockOrder.items.map(item => (
                    <div key={item.id} className="track-item">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <h4>{item.name}</h4>
                        <span>Size: {item.size} | Qty: {item.qty}</span>
                      </div>
                      <span>{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                  
                  <div className="track-totals">
                    <div><span>Subtotal</span> <span>{formatPrice(mockOrder.subtotal)}</span></div>
                    <div><span>Shipping</span> <span>Free</span></div>
                    <div className="total"><span>Total</span> <span>{formatPrice(mockOrder.total)}</span></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="btn-secondary back-to-search" onClick={() => setShowResults(false)}>
              Track Another Order
            </button>
          </motion.div>
        )}

      </div>

      {/* SUPPORT SECTION */}
      <section className="track-support-section">
        <h2>We're Here to Help.</h2>
        <p>Need a hand with your order? Our team is happy to assist.</p>
        <div className="support-links">
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/returns">Returns & Exchanges</Link>
        </div>
      </section>

    </div>
  );
};

export default TrackOrderPage;