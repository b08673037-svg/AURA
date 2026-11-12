import { useState } from 'react';
import { FiArrowRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { subscribeToNewsletter } from '../../services/newsletterService';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await subscribeToNewsletter(email);
      setStatus("success");
      setMessage("Welcome to the AURA Inner Circle. Keep an eye on your inbox.");
      setEmail(""); // Clear input on success
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <section className="newsletter-section">
      
      {/* LEFT: Editorial Image */}
      <motion.div 
        className="newsletter-image-side"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <img 
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop" 
          alt="AURA Campaign" 
        />
      </motion.div>

      {/* RIGHT: Newsletter Content */}
      <motion.div 
        className="newsletter-content-side"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span className="newsletter-eyebrow">A LITTLE SOMETHING EXTRA</span>
        
        <h2 className="newsletter-title">
          Something Beautiful<br/>
          <span className="italic">Is Coming Your Way.</span>
        </h2>
        
        <p className="newsletter-description">
          Step into the world of AURA. Be the first to discover new collections, timeless essentials, exclusive offers, and inspiration designed around your style.
        </p>

        <span className="membership-label">THE AURA INNER CIRCLE</span>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading" || status === "success"}
              aria-label="Email address"
            />
            <button 
              type="submit" 
              disabled={status === "loading" || status === "success"}
              className="subscribe-btn"
            >
              {status === "loading" ? "JOINING..." : "JOIN THE INNER CIRCLE"}
              {status !== "loading" && <FiArrowRight />}
            </button>
          </div>
        </form>

        {/* Success or Error Message */}
        {status === "success" && (
          <motion.div 
            className="form-message success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiCheckCircle /> {message}
          </motion.div>
        )}
        {status === "error" && (
          <motion.div 
            className="form-message error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiAlertCircle /> {message}
          </motion.div>
        )}

        <p className="privacy-note">
          "No noise. Just beautiful things. Unsubscribe anytime."
        </p>
      </motion.div>

    </section>
  );
};

export default Newsletter;