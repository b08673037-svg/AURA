import { FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useQuickView } from '../../context/QuickViewContext';
import LookHotspot from './LookHotspot';
import LookProduct from './LookProduct';
import toast from 'react-hot-toast';
import './LookCampaign.css';

const LookCampaign = ({ campaign, reverse }) => {
  const { addToCart } = useCart();
  const { openQuickView } = useQuickView();

  const handleShopCompleteLook = () => {
    let addedCount = 0;
    
    campaign.products.forEach(product => {
      // Add the live DB product to cart
      addToCart(product, 1, "M", "Default"); 
      addedCount++;
    });

    toast.success(`Added ${addedCount} items to your bag!`);
  };

  const handleOpenQuickView = (product) => {
    // The product is already perfectly formatted by useStoreProducts
    openQuickView(product);
  };

  return (
    <div className={`look-campaign ${reverse ? 'reverse' : ''}`}>
      
      <motion.div 
        className="look-image-side"
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span className="look-number">{campaign.lookNumber}</span>
        <div className="look-image-wrapper">
          <img src={campaign.modelImage} alt={campaign.campaignLabel} />
          {campaign.products.map((product) => (
            <LookHotspot 
              key={product.id} 
              product={product} 
              position={product.hotspot} 
              onOpen={() => handleOpenQuickView(product)}
            />
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="look-content-side"
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        <span className="look-campaign-label">{campaign.campaignLabel}</span>
        <h2 className="look-title">
          {campaign.title.split('\n').map((line, i) => (
            <span key={i}>{line}<br/></span>
          ))}
        </h2>
        <p className="look-description">{campaign.description}</p>
        
        <div className="look-products-list">
          {campaign.products.map((product) => (
            <LookProduct 
              key={product.id} 
              product={product} 
              onOpen={handleOpenQuickView}
            />
          ))}
        </div>

        <motion.button 
          className="btn-primary shop-look-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShopCompleteLook}
        >
          Shop Complete Look <FiShoppingBag />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LookCampaign;