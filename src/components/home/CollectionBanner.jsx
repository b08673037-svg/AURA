import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './CollectionBanner.css';

const CollectionBanner = ({ title, subtitle, image, link, theme }) => {
  return (
    <div className={`collection-banner ${theme}`}>
      <div className="banner-content">
        <h3>{title}</h3>
        <p>{subtitle}</p>
        
        {/* The button is a React Router Link that navigates to the correct shop path */}
        <Link 
          to={link} 
          className={`banner-btn ${theme === 'dark' ? 'btn-light' : 'btn-dark'}`}
        >
          Shop Now <FiArrowRight />
        </Link>
      </div>
      
      <div className="banner-image">
        <img src={image} alt={title} />
      </div>
    </div>
  );
};

export default CollectionBanner;