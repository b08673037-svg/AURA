import { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './InfoPage.css'; // We will share the CSS

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: "How can I track my order?", a: "You can track your order by visiting the 'Track Order' page in the footer and entering your order number and email." },
    { q: "What payment methods do you accept?", a: "We currently accept Cash on Delivery (COD) for all orders within Pakistan." },
    { q: "How long does delivery take?", a: "Standard delivery takes 3-5 business days. Express delivery takes 1-2 business days." },
    { q: "Can I change or cancel my order?", a: "Please contact our customer support team as soon as possible. We can only make changes if your order has not yet been processed for shipping." },
    { q: "Do you ship internationally?", a: "Currently, we only ship within Pakistan. We are working on expanding our shipping soon." },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="info-page-wrapper">
      <div className="info-hero">
        <span className="info-eyebrow">AURA HELP CENTER</span>
        <h1>Frequently Asked Questions</h1>
        <p>Quick answers to help make your shopping experience easier.</p>
      </div>

      <div className="info-content">
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button className="faq-trigger" onClick={() => toggleFaq(index)}>
                <span>{faq.q}</span>
                {openIndex === index ? <FiMinus /> : <FiPlus />}
              </button>
              <AnimatePresence>
                {openIndex === index && (
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
    </div>
  );
};

export default FAQPage;