import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useQuickView } from '../../context/QuickViewContext';
import './AccountWishlist.css';

const AccountWishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { openQuickView } = useQuickView();

  const formatPrice = (price) => `PKR ${price.toLocaleString()}`;

  if (wishlistItems.length === 0) {
    return (
      <div className="account-wishlist">
        <div className="page-header">
          <h1>My Wishlist</h1>
          <p>Pieces you've loved, ready whenever you are.</p>
        </div>
        
        <div className="empty-state">
          <FiHeart size={48} className="empty-icon" />
          <h3>Your favorite pieces are waiting for you.</h3>
          <p>Tap the heart icon on any product to save it for later.</p>
          <Link to="/collections" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            Discover Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="account-wishlist">
      <div className="page-header">
        <h1>My Wishlist</h1>
        <p>Pieces you've loved, ready whenever you are.</p>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map(item => (
          <div key={item.id} className="account-wishlist-card">
            <div className="wishlist-image">
              <Link to={`/product/${item.slug || item.id}`}>
                <img src={item.images?.[0] || item.image} alt={item.name} />
              </Link>
              <button 
                className="remove-btn" 
                onClick={() => removeFromWishlist(item.id)}
                aria-label="Remove from wishlist"
              >
                <FiTrash2 />
              </button>
            </div>
            
            <div className="wishlist-info">
              <span className="wishlist-category">{item.category}</span>
              <Link to={`/product/${item.slug || item.id}`} className="wishlist-name">
                {item.name}
              </Link>
              <span className="wishlist-price">{formatPrice(item.price)}</span>
              
              <div className="wishlist-actions">
                <button 
                  className="btn-primary add-btn"
                  onClick={() => openQuickView(item)}
                >
                  Add to Bag <FiShoppingBag />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountWishlist;