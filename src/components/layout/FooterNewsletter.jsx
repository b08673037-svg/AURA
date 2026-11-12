import { useState } from 'react';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { subscribeToNewsletter } from '../../services/newsletterService';
import './FooterNewsletter.css';

const FooterNewsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading" || status === "success") return;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email.");
      return;
    }

    setStatus("loading");
    try {
      await subscribeToNewsletter(email);
      setStatus("success");
      setMessage("Welcome to the exclusive circle.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <div className="footer-newsletter-section">
      
      {/* Left Image */}
      <div className="footer-newsletter-image">
        <img 
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop" 
          alt="AURA Exclusive Circle" 
        />
      </div>

      {/* Right Content */}
      <div className="footer-newsletter-content">
        <div className="newsletter-header">
          <span className="newsletter-line"></span>
          <span className="newsletter-eyebrow">STAY IN STYLE</span>
        </div>
        
        <h2>Join Our Exclusive Circle</h2>
        <p>Be the first to know about new collections, special offers, and timeless style inspiration.</p>
        
        <form onSubmit={handleSubmit} className="footer-newsletter-form">
          <div className="input-wrapper">
            <FiMail className="input-icon" />
            <input 
              type="email" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="subscribe-btn">
              {status === "loading" ? "..." : "Subscribe"}
              {status !== "loading" && <FiArrowRight />}
            </button>
          </div>
        </form>

        {status === "success" && <span className="newsletter-msg success">{message}</span>}
        {status === "error" && <span className="newsletter-msg error">{message}</span>}

        <div className="privacy-note">
          <FiLock size={12} />
          <span>Your information is safe with us.</span>
        </div>
      </div>
    </div>
  );
};

export default FooterNewsletter;