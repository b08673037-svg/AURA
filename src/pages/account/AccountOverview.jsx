import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiHeart, FiMapPin, FiClock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders } from '../../services/orderService';
import { getUserAddresses } from '../../services/addressService';
import { useWishlist } from '../../context/WishlistContext';
import './AccountOverview.css';

const AccountOverview = () => {
  const { userProfile, currentUser } = useAuth();
  const { wishlistItems } = useWishlist();
  
  const [orders, setOrders] = useState([]);
  const [addressesCount, setAddressesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const firstName = userProfile?.firstName || "Customer";

  // Fetch real data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        const fetchedOrders = await getUserOrders(currentUser.uid);
        setOrders(fetchedOrders);
        
        const fetchedAddresses = await getUserAddresses(currentUser.uid);
        setAddressesCount(fetchedAddresses.length);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [currentUser]);

  // Calculate real stats
  const activeOrders = orders.filter(o => ['pending', 'processing', 'shipped'].includes((o.orderStatus || '').toLowerCase())).length;
  
  const stats = [
    { title: "Total Orders", value: orders.length, icon: <FiPackage /> },
    { title: "Active Orders", value: activeOrders, icon: <FiClock /> },
    { title: "Wishlist Items", value: wishlistItems.length, icon: <FiHeart /> },
    { title: "Saved Addresses", value: addressesCount, icon: <FiMapPin /> }
  ];

  const recentOrders = orders.slice(0, 2); // Show latest 2 orders

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading your dashboard...</div>;
  }

  return (
    <div className="account-overview">
      <div className="page-header">
        <h1>Welcome Back, {firstName}.</h1>
        <p>Your personal space for everything AURA.</p>
      </div>

      <div className="summary-cards-grid">
        {stats.map((stat, index) => (
          <div key={index} className="summary-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-title">{stat.title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-orders-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link to="/account/orders" className="view-all-link">View All Orders <FiArrowRight /></Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="orders-list">
            {recentOrders.map((order) => (
              <div key={order.id} className="order-row">
                <div className="order-info">
                  <span className="order-id">{order.id}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="order-meta">
                  <span>{order.items?.length || 0} Items</span>
                  <span>PKR {order.total?.toLocaleString()}</span>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${(order.orderStatus || 'pending').toLowerCase()}`}>{order.orderStatus || "Pending"}</span>
                </div>
                <Link to={`/account/orders/${order.id}`} className="order-action">View Details</Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-orders" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#F8F5F0', borderRadius: '4px' }}>
            <p>No recent orders found. <Link to="/collections" style={{ color: '#873B4C', textDecoration: 'underline' }}>Start Shopping</Link></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountOverview;