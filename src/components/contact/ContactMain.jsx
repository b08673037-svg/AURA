import { useState } from 'react';
import { FiMail, FiPhone, FiClock, FiInstagram, FiFacebook, FiArrowRight } from 'react-icons/fi';
import { FaPinterestP } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { contactConfig } from '../../data/contactConfig';
import './ContactMain.css';

const ContactMain = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', inquiryType: 'General Inquiry', orderNumber: '', message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Frontend only - simulate success
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', inquiryType: 'General Inquiry', orderNumber: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="contact-main-section" id="contact-form">
      <div className="contact-main-container">
        
        {/* LEFT: Contact Info */}
        <motion.div 
          className="contact-info-col"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="contact-eyebrow">LET'S CONNECT</span>
          <h2>We're Here to Help.</h2>
          <p className="info-desc">At AURA, every customer matters. Our team is here to assist you with your shopping experience and answer any questions you may have.</p>

          <div className="info-blocks">
            <div className="info-block">
              <FiMail className="info-icon" />
              <div>
                <span className="info-label">Email Support</span>
                <a href={`mailto:${contactConfig.email}`} className="info-value">{contactConfig.email}</a>
              </div>
            </div>

            <div className="info-block">
              <FiPhone className="info-icon" />
              <div>
                <span className="info-label">Phone Support</span>
                <a href={`tel:${contactConfig.phone}`} className="info-value">{contactConfig.phone}</a>
              </div>
            </div>

            <div className="info-block">
              <FiClock className="info-icon" />
              <div>
                <span className="info-label">Hours</span>
                <span className="info-value">{contactConfig.hours}</span>
              </div>
            </div>
          </div>

          <div className="contact-socials">
            <span className="info-label">Follow Us</span>
            <div className="social-icons">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"><FiInstagram /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer"><FiFacebook /></a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer"><FaPinterestP /></a>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Form */}
        <motion.div 
          className="contact-form-col"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="form-header">
            <h3>Send Us a Message</h3>
            <p>Have a question? We'd love to hear from you.</p>
          </div>

          <form onSubmit={handleSubmit} className="premium-contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone (Optional)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Inquiry Type</label>
                <select name="inquiryType" value={formData.inquiryType} onChange={handleChange}>
                  <option>General Inquiry</option>
                  <option>Order Assistance</option>
                  <option>Shipping & Delivery</option>
                  <option>Returns & Exchanges</option>
                  <option>Product Information</option>
                  <option>Payment Assistance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Order Number (Optional)</label>
                <input type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange} placeholder="#AURA-12345" />
              </div>
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea name="message" rows="4" value={formData.message} onChange={handleChange} required></textarea>
            </div>

            <button type="submit" className="btn-primary submit-btn">
              {isSubmitted ? "Message Sent Successfully!" : "Send Message"} 
              {!isSubmitted && <FiArrowRight />}
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  );
};

export default ContactMain;