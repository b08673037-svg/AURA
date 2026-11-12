import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiTruck, FiRefreshCw, FiShoppingBag, FiHelpCircle, FiPlus, FiMinus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './HelpPage.css';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const helpCategories = [
    { title: "Track Your Order", desc: "Follow your package's journey.", icon: <FiTruck />, link: "/track-order" },
    { title: "Shipping & Delivery", desc: "Rates, times, and locations.", icon: <FiTruck />, link: "/shipping" },
    { title: "Returns & Exchanges", desc: "Start a return or exchange.", icon: <FiRefreshCw />, link: "/returns" },
    { title: "Shopping Help", desc: "Sizing, product info, and more.", icon: <FiShoppingBag />, link: "/faq" },
  ];

  const faqs = [
    { q: "How can I track my order?", a: "You can track your order by visiting the 'Track Order' page and entering your order number and email." },
    { q: "What is your return policy?", a: "We offer a 14-day return policy on unworn items with original tags. Please visit our Returns page for more details." },
    { q: "How long does delivery take?", a: "Standard delivery usually takes 3-5 business days. Express delivery takes 1-2 business days." },
    { q: "Do you ship internationally?", a: "Currently, we only ship within Pakistan. We are working on expanding our shipping soon." },
    { q: "How can I contact customer support?", a: "You can reach us via our Contact page, or email us directly at hello@aura.com." },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="help-page-wrapper">
      
      {/* HERO */}
      <section className="help-hero">
        <motion.span 
          className="help-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AURA CUSTOMER CARE
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          How Can We Help?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Find answers to your questions or get in touch with our team.
        </motion.p>
        
        <motion.div 
          className="help-search-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search for answers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>
      </section>

      {/* CATEGORIES */}
      <section className="help-categories-section">
        <div className="help-categories-grid">
          {helpCategories.map((cat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={cat.link} className="help-category-card">
                <span className="category-icon">{cat.icon}</span>
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="help-faq-section">
        <div className="help-faq-container">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to help make your shopping experience easier.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button className="faq-trigger" onClick={() => toggleFaq(index)}>
                  <span>{faq.q}</span>
                  {openFaq === index ? <FiMinus /> : <FiPlus />}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="help-cta-section">
        <FiHelpCircle size={40} />
        <h2>Still need help?</h2>
        <p>Our customer care team is here to assist you.</p>
        <Link to="/contact" className="btn-primary">Contact Us</Link>
      </section>

    </div>
  );
};

export default HelpPage;