import { Link } from 'react-router-dom';
import { FiPackage, FiHeart, FiMapPin, FiClock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AccountOverview.css';

const AccountOverview = () => {
  const { userProfile } = useAuth();
  const firstName = userProfile?.firstName || "Customer";

  // Mock data (to be replaced by Firebase later)
  const stats = [
    { title: "Total Orders", value: "12", icon: <FiPackage /> },
    { title: "Active Orders", value: "2", icon: <FiClock /> },
    { title: "Wishlist Items", value: "5", icon: <FiHeart /> },
    { title: "Saved Addresses", value: "1", icon: <FiMapPin /> }
  ];

  const recentOrders = [
    { id: "AURA-84920", date: "Oct 24, 2026", status: "Shipped", total: "PKR 23,997", items: 3 },
    { id: "AURA-81104", date: "Sep 12, 2026", status: "Delivered", total: "PKR 8,999", items: 1 }
  ];

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

        <div className="orders-list">
          {recentOrders.map((order) => (
            <div key={order.id} className="order-row">
              <div className="order-info">
                <span className="order-id">{order.id}</span>
                <span className="order-date">{order.date}</span>
              </div>
              <div className="order-meta">
                <span>{order.items} Items</span>
                <span>{order.total}</span>
              </div>
              <div className="order-status">
                <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              <Link to={`/account/orders/${order.id}`} className="order-action">View Details</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;