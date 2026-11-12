import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiMapPin, FiCreditCard, FiTruck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders } from '../../services/orderService';
import './AccountOrderDetails.css';

const AccountOrderDetails = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (currentUser) {
        const orders = await getUserOrders(currentUser.uid);
        const foundOrder = orders.find(o => o.id === orderId || o.orderId === orderId);
        setOrder(foundOrder);
      }
      setIsLoading(false);
    };
    fetchOrder();
  }, [currentUser, orderId]);

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <h2>Order Not Found</h2>
        <p>We couldn't find this order in your account.</p>
        <Link to="/account/orders" className="btn-primary">Back to Orders</Link>
      </div>
    );
  }

  // Read both `status` and `orderStatus` for backward compatibility
  const displayStatus = order.status || order.orderStatus || "Pending";

  return (
    <div className="account-order-details">
      <div className="page-header">
        <Link to="/account/orders" className="back-link"><FiArrowLeft /> Back to Orders</Link>
        <div className="order-title-row">
          <h1>Order #{order.id}</h1>
          <span className={`status-badge ${displayStatus.toLowerCase()}`}>
            {displayStatus}
          </span>
        </div>
        <p>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="order-details-grid">
        {/* LEFT COLUMN: Items */}
        <div className="order-items-section">
          <h2>Items Ordered</h2>
          <div className="items-list">
            {order.items && order.items.map((item, idx) => (
              <div key={idx} className="detail-item-row">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>Size: {item.size || "One Size"} | Color: {item.color || "Default"}</p>
                  <p>Qty: {item.quantity}</p>
                </div>
                <span className="item-price">PKR {item.price?.toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div><span>Subtotal</span><span>PKR {order.subtotal?.toLocaleString()}</span></div>
            <div><span>Shipping</span><span>{order.shipping === 0 ? "Free" : `PKR ${order.shipping}`}</span></div>
            <div className="total"><span>Total</span><span>PKR {order.total?.toLocaleString()}</span></div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details */}
        <div className="order-info-section">
          
          <div className="info-card">
            <div className="card-title"><FiTruck /> Delivery Address</div>
            <p>{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
            <p>{order.deliveryAddress?.address}</p>
            <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.postalCode}</p>
            <p>{order.deliveryAddress?.country}</p>
            <p className="phone">{order.customerInfo?.phone}</p>
          </div>

          <div className="info-card">
            <div className="card-title"><FiCreditCard /> Payment Information</div>
            <p><strong>Method:</strong> {order.paymentMethod}</p>
            <p><strong>Status:</strong> {order.paymentStatus}</p>
          </div>

          <div className="info-card">
            <div className="card-title"><FiPackage /> Order Notes</div>
            <p>{order.notes || "No notes provided."}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountOrderDetails;