import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiChevronDown, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ShopMegaMenu from './ShopMegaMenu';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  
  const megaMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser } = useAuth();

  // Close menus on route change
  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMegaMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMegaMenuOpen(!isMegaMenuOpen);
    setIsSearchOpen(false); // Close search if mega menu opens
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsMegaMenuOpen(false); // Close mega menu if search opens
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery(""); 
    }
  };

  return (
    <nav className="navbar" ref={megaMenuRef}>
      <div className="navbar-container">
        
        <Link to="/" className="navbar-logo">
          AURA<span>.</span>
        </Link>

        <ul className="navbar-links">
          <li><NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink></li>
          
          <li className="nav-item-wrapper">
            <div className="nav-link-split">
              <Link to="/shop" className={`nav-link ${isMegaMenuOpen ? 'active' : ''}`}>Shop</Link>
              <button 
                className={`nav-arrow-btn ${isMegaMenuOpen ? 'active' : ''}`}
                onClick={toggleMegaMenu}
                aria-label="Toggle Shop Menu"
              >
                <motion.span animate={{ rotate: isMegaMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FiChevronDown />
                </motion.span>
              </button>
            </div>
          </li>

          <li><NavLink to="/shop/men" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Men</NavLink></li>
          <li><NavLink to="/shop/women" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Women</NavLink></li>
          <li><NavLink to="/shop/new-arrivals" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>New Arrivals</NavLink></li>
          <li><NavLink to="/collections" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Collections</NavLink></li>
          <li><NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>About</NavLink></li>
          <li><NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Contact</NavLink></li>
        </ul>

        <div className="navbar-actions">
          <div className="icon-group">
            {/* Search Icon */}
            <button className="icon-link search-icon-btn" onClick={toggleSearch} title="Search">
              {isSearchOpen ? <FiX size={20} /> : <FiSearch size={20} />}
            </button>

            <Link to={currentUser ? "/account" : "/login"} className="icon-link" title={currentUser ? "My Account" : "Sign In"}>
              <FiUser size={20} />
            </Link>
            
            <Link to="/wishlist" className="icon-link wishlist-icon">
              <FiHeart size={20} />
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
            </Link>
            
            <Link to="/cart" className="icon-link cart-icon">
              <FiShoppingBag size={20} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* SEARCH DROPDOWN OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            className="search-dropdown"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="search-dropdown-inner">
              <form onSubmit={handleSearch} className="expanded-search-form">
                <FiSearch size={24} className="search-bar-icon" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search for products, collections, or styles..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} className="close-search-btn">
                  Cancel
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMegaMenuOpen && (
          <ShopMegaMenu onClose={() => setIsMegaMenuOpen(false)} />
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;