import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './CollectionCard.css';

const CollectionCard = ({ collection, index }) => {
  return (
    <motion.div 
      className="collection-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link to={collection.link} className="collection-card-link">
        <div className="collection-image-wrapper">
          <img src={collection.image} alt={collection.title} />
          <div className="collection-overlay">
            <span className="collection-eyebrow">{collection.eyebrow}</span>
            <h3 className="collection-title">{collection.title}</h3>
            <p className="collection-desc">{collection.description}</p>
            <span className="collection-cta">
              Explore Collection <FiArrowRight />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CollectionCard;