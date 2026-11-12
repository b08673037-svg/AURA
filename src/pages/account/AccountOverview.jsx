import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiHeart, FiMapPin, FiClock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { getUserOrders } from '../../services/orderService';
import { getUserAddresses } from '../../services/addressService';
import { onValue, ref } from 'firebase/database';
import { db } from '../../services/firebase';
import './AccountOverview.css';

const AccountOverview = () => {
  const { currentUser, userProfile } = useAuth();
  const { wishlistItems } = useWishlist();
  
  const [orders, setOrders] = useState([]);
  const [addressesCount, setAddressesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Use firstName if available, otherwise fall back to email prefix or "Customer"
  const firstName = userProfile?.firstName || 
                    currentUser?.email?.split('@')[0] || 
                    "Customer";

  useEffect(() => {
    let ordersLoaded = false;
    let addressesLoaded = false;

    const check = () => {
      if (ordersLoaded && addressesLoaded) setIsLoading(false);
    };

    // 1. Real-time listener for orders
    const ordersRef = ref(db, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const userOrders = Object.values(data)
        .filter(order => order.userId === currentUser?.uid)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setOrders(userOrders);
      ordersLoaded = true;
      check();
    });

    // 2. Fetch addresses once
    const fetchAddresses = async () => {
      if (currentUser) {
        const fetchedAddresses = await getUserAddresses(currentUser.uid);
        setAddressesCount(fetchedAddresses.length);
      }
      addressesLoaded = true;
      check();
    };

    if (currentUser) {
      fetchAddresses();
    } else {
      setIsLoading(false);
    }

    return () => unsubscribeOrders();
  }, [currentUser]);

  // Calculate real stats
  const activeOrders = orders.filter(o => 
    ['pending', 'processing', 'shipped'].includes(
      String(o.status || o.orderStatus || '').toLowerCase()
    )
  ).length;
  
  const stats = [
    { title: "Total Orders", value: orders.length, icon: <FiPackage /> },
    { title: "Active Orders", value: activeOrders, icon: <FiClock /> },
    { title: "Wishlist Items", value: wishlistItems.length, icon: <FiHeart /> },
    { title: "Saved Addresses", value: addressesCount, icon: <FiMapPin /> }
  ];

  const recentOrders = orders.slice(0, 3);

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p>Loading your dashboard...</p>
      </div>
    );
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
          <Link to="/account/orders" className="view-all-link">
            View All Orders <FiArrowRight />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="orders-list">
            {recentOrders.map((order) => {
              const status = order.status || order.orderStatus || 'Pending';
              return (
                <div key={order.id} className="order-row">
                  <div className="order-info">
                    <span className="order-id">
                      #{order.orderNumber || order.id?.slice(-8).toUpperCase()}
                    </span>
                    <span className="order-date">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="order-meta">
                    <span>{order.items?.length || 0} Items</span>
                    <span>PKR {order.total?.toLocaleString() || 0}</span>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>
                  <Link to={`/account/orders/${order.id}`} className="order-action">
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-orders" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#F8F5F0', borderRadius: '4px' }}>
            <FiPackage size={32} style={{ color: '#873B4C', marginBottom: '1rem' }} />
            <p style={{ marginBottom: '1rem' }}>You haven't placed any orders yet.</p>
            <Link to="/collections" style={{ color: '#873B4C', textDecoration: 'underline', fontWeight: 600 }}>
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountOverview;