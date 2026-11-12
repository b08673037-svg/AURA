import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { megaMenuData } from '../../data/megaMenuData';
import './ShopMegaMenu.css';

const ShopMegaMenu = ({ onClose }) => {
  return (
    <motion.div 
      className="mega-menu-panel"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mega-menu-inner">
        
        <div className="mega-menu-header">
          <span className="mega-eyebrow">EXPLORE AURA</span>
          <h2>Discover Your Style</h2>
        </div>

        <div className="mega-menu-grid">
          
          {/* Men's Column */}
          <div className="mega-col">
            <Link to={megaMenuData.men.link} className="mega-col-title" onClick={onClose}>
              {megaMenuData.men.title}
            </Link>
            <ul>
              {megaMenuData.men.categories.map((cat) => (
                <li key={cat.name}>
                  {/* If slug is 'men', go to main men page. Otherwise, go to category */}
                  <Link 
                    to={cat.slug === 'men' ? '/shop/men' : `/shop/${cat.slug}`} 
                    onClick={onClose}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={megaMenuData.men.link} className="view-all-link" onClick={onClose}>
                  View All Men →
                </Link>
              </li>
            </ul>
          </div>

          {/* Women's Column */}
          <div className="mega-col">
            <Link to={megaMenuData.women.link} className="mega-col-title" onClick={onClose}>
              {megaMenuData.women.title}
            </Link>
            <ul>
              {megaMenuData.women.categories.map((cat) => (
                <li key={cat.name}>
                  <Link 
                    to={cat.slug === 'women' ? '/shop/women' : `/shop/${cat.slug}`} 
                    onClick={onClose}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={megaMenuData.women.link} className="view-all-link" onClick={onClose}>
                  View All Women →
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial Campaigns */}
          <div className="mega-col mega-col-campaigns">
            {megaMenuData.campaigns.map((campaign, idx) => (
              <Link to={campaign.link} key={idx} className="mega-campaign-card" onClick={onClose}>
                <div className="campaign-image-wrapper">
                  <img src={campaign.image} alt={campaign.title} />
                </div>
                <div className="campaign-text">
                  <h4>{campaign.title}</h4>
                  <p>{campaign.description}</p>
                  <span>Explore →</span>
                </div>
              </Link>
            ))}
          </div>

        </div>

        <div className="mega-menu-footer">
          <Link to="/shop/new-arrivals" onClick={onClose}>NEW ARRIVALS</Link>
          <Link to="/shop/best-sellers" onClick={onClose}>BEST SELLERS</Link>
          <Link to="/shop/accessories" onClick={onClose}>ACCESSORIES</Link>
          <Link to="/shop/shoes" onClick={onClose}>SHOES</Link>
        </div>

      </div>
    </motion.div>
  );
};

export default ShopMegaMenu;