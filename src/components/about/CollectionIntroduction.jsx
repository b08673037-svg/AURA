import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './CollectionIntroduction.css';

const CollectionIntroduction = () => {
  const collections = [
    {
      title: "The Modern Gentleman",
      desc: "Refined essentials and contemporary styles for everyday confidence.",
      link: "/shop/men",
      image: "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=800&auto=format&fit=crop",
      cta: "Explore Men"
    },
    {
      title: "Effortless Elegance",
      desc: "Beautiful silhouettes and timeless pieces for every occasion.",
      link: "/shop/women",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
      cta: "Explore Women"
    },
    {
      title: "The Finishing Touch",
      desc: "Thoughtful details that bring every look together.",
      link: "/shop/accessories",
      image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=800&auto=format&fit=crop",
      cta: "Explore Accessories"
    }
  ];

  return (
    <section className="about-collections-section">
      <div className="about-collections-container">
        
        <div className="collections-header">
          <h2>Made for Every Expression</h2>
          <p>Explore collections designed to complement your individuality and bring confidence to every moment.</p>
        </div>

        <div className="about-collections-grid">
          {collections.map((col, index) => (
            <motion.div 
              key={index} 
              className="about-collection-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link to={col.link} className="col-card-link">
                <div className="col-image-wrapper">
                  <img src={col.image} alt={col.title} />
                </div>
                <div className="col-text">
                  <h3>{col.title}</h3>
                  <p>{col.desc}</p>
                  <span>{col.cta} <FiArrowRight /></span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CollectionIntroduction;