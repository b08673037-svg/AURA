import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiUser, FiShoppingBag, FiHeart, FiMapPin, FiSettings, FiLogOut, FiTruck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AccountLayout.css';

const AccountLayout = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  
  // Local state to force re-render when profile loads
  const [displayName, setDisplayName] = useState("Customer");
  const [initial, setInitial] = useState("C");

  // Update display data whenever userProfile changes
  useEffect(() => {
    if (userProfile) {
      const firstName = userProfile.firstName || "Customer";
      const lastName = userProfile.lastName || "";
      setDisplayName(`${firstName} ${lastName}`.trim());
      setInitial(firstName.charAt(0).toUpperCase());
    } else if (currentUser?.email) {
      // Fallback to email initial if profile is missing
      setDisplayName("AURA Customer");
      setInitial(currentUser.email.charAt(0).toUpperCase());
    }
  }, [userProfile, currentUser]);

  const displayEmail = userProfile?.email || currentUser?.email || "";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      toast.error("Failed to log out.");
    }
  };

  return (
    <div className="account-layout-wrapper">
      <div className="account-container">
        
        <aside className="account-sidebar">
          <div className="user-profile-summary">
            <div className="user-avatar">{initial}</div>
            <h3>{displayName}</h3>
            <p>{displayEmail}</p>
          </div>

          <nav className="account-nav">
            <NavLink to="/account" end className={({ isActive }) => isActive ? "account-nav-link active" : "account-nav-link"}>
              <FiUser /> Overview
            </NavLink>
            <NavLink to="/account/orders" className={({ isActive }) => isActive ? "account-nav-link active" : "account-nav-link"}>
              <FiShoppingBag /> My Orders
            </NavLink>
            <NavLink to="/account/track-order" className={({ isActive }) => isActive ? "account-nav-link active" : "account-nav-link"}>
              <FiTruck /> Track Orders
            </NavLink>
            <NavLink to="/account/wishlist" className={({ isActive }) => isActive ? "account-nav-link active" : "account-nav-link"}>
              <FiHeart /> My Wishlist
            </NavLink>
            <NavLink to="/account/addresses" className={({ isActive }) => isActive ? "account-nav-link active" : "account-nav-link"}>
              <FiMapPin /> My Addresses
            </NavLink>
            <NavLink to="/account/profile" className={({ isActive }) => isActive ? "account-nav-link active" : "account-nav-link"}>
              <FiUser /> Personal Info
            </NavLink>
            <NavLink to="/account/settings" className={({ isActive }) => isActive ? "account-nav-link active" : "account-nav-link"}>
              <FiSettings /> Account Settings
            </NavLink>
          </nav>

          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Sign Out
          </button>
        </aside>

        <main className="account-main-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AccountLayout;