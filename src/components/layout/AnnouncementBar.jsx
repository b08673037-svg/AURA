import { Link } from 'react-router-dom';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  return (
    <div className="announcement-bar">
      <div className="announcement-content">
        <span>✦ Free Shipping on Orders Above PKR 5,000 | Limited Time Offer!</span>
      </div>
      <div className="announcement-links">
        {/* These now use React Router Links to prevent full page reloads */}
        <Link to="/track-order">Track Order</Link>
        <span>|</span>
        <Link to="/help">Help</Link>
        <span>|</span>
        <Link to="/contact">Contact</Link>
      </div>
    </div>
  );
};

export default AnnouncementBar;