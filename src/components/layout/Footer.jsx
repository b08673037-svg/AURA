import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiYoutube, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaPinterestP } from 'react-icons/fa';
import { footerLinks, contactInfo } from '../../data/footerData';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        {/* Column 1: Brand */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo">AURA<span>.</span></Link>
          <p className="brand-tagline">Timeless Style. Everyday Confidence.</p>
          <p className="brand-desc">
            AURA is more than fashion — it's a statement of confidence, elegance, and you.
          </p>
          <div className="footer-divider"></div>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FiInstagram /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FiFacebook /></a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer"><FaPinterestP /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer"><FiYoutube /></a>
          </div>
        </div>

        {/* Column 2: Shop */}
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            {footerLinks.shop.map((link, i) => (
              <li key={i}><Link to={link.path}>{link.name}</Link></li>
            ))}
          </ul>
        </div>

        {/* Column 3: Customer Service */}
        <div className="footer-col">
          <h4>Customer Service</h4>
          <ul>
            {footerLinks.customerService.map((link, i) => (
              <li key={i}><Link to={link.path}>{link.name}</Link></li>
            ))}
            <li><Link to="/track-order">Track Order</Link></li>
          </ul>
        </div>

        {/* Column 4: About */}
        <div className="footer-col">
          <h4>About</h4>
          <ul>
            {footerLinks.about.map((link, i) => (
              <li key={i}><Link to={link.path}>{link.name}</Link></li>
            ))}
          </ul>
        </div>

        {/* Column 5: Contact */}
        <div className="footer-col contact-col">
          <h4>Get in Touch</h4>
          <ul className="contact-list">
            <li>
              <FiMapPin className="contact-icon" />
              <span>{contactInfo.address}</span>
            </li>
            <li>
              <FiPhone className="contact-icon" />
              <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}>{contactInfo.phone}</a>
            </li>
            <li>
              <FiMail className="contact-icon" />
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} AURA. All Rights Reserved.</p>
        <div className="payment-icons">
          <span>Visa</span>
          <span>MasterCard</span>
          <span>COD</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;