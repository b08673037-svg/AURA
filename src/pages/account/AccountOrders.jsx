import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders } from '../../services/orderService';
import './AccountOrders.css';

const AccountOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser) {
        const fetchedOrders = await getUserOrders(currentUser.uid);
        setOrders(fetchedOrders);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, [currentUser]);

  // Read both `status` and `orderStatus` for backward compatibility
  const getOrderStatusValue = (order) => order.status || order.orderStatus || "Pending";

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || getOrderStatusValue(order).toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading your orders...</div>;
  }

  return (
    <div className="account-orders">
      <div className="page-header">
        <h1>My Orders</h1>
        <p>View and track your recent AURA purchases.</p>
      </div>

      <div className="orders-toolbar">
        <div className="search-box">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search by order number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <FiFilter />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="orders-list">
          {filteredOrders.map(order => {
            const status = getOrderStatusValue(order);
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-meta">
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`status-badge ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-images">
                    {order.items && order.items.slice(0, 3).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name} />
                    ))}
                    {order.items && order.items.length > 3 && (
                      <div className="more-items">+{order.items.length - 3}</div>
                    )}
                  </div>
                  
                  <div className="order-total">
                    <span className="total-label">Total</span>
                    <span className="total-amount">PKR {order.total?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="order-card-footer">
                  <span className="payment-status">Payment: {order.paymentMethod || "COD"}</span>
                  <div className="order-actions">
                    <Link to={`/account/orders/${order.id}`} className="btn-secondary">View Details</Link>
                    <Link to="/track-order" className="btn-primary">Track Order</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-orders">
          <FiPackage size={48} className="empty-icon" />
          <h3>Your AURA journey starts here.</h3>
          <p>You haven't placed any orders yet.</p>
          <Link to="/collections" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            Explore Collections
          </Link>
        </div>
      )}
    </div>
  );
};

export default AccountOrders;