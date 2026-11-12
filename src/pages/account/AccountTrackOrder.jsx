import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiChevronRight } from 'react-icons/fi';
import './AccountTrackOrder.css';

const AccountTrackOrder = () => {
  // Mock Active Orders (To be replaced by Firebase)
  const activeOrders = [
    {
      id: "AURA-84920",
      date: "Oct 24, 2026",
      status: "Shipped",
      estimatedDelivery: "Oct 28, 2026",
      total: "PKR 23,997",
      items: 3,
      timeline: [
        { label: "Order Placed", date: "Oct 24", done: true },
        { label: "Confirmed", date: "Oct 24", done: true },
        { label: "Processing", date: "Oct 25", done: true },
        { label: "Shipped", date: "Oct 26", done: true, current: true },
        { label: "Out for Delivery", date: "Pending", done: false },
        { label: "Delivered", date: "Pending", done: false }
      ]
    },
    {
      id: "AURA-85112",
      date: "Oct 26, 2026",
      status: "Processing",
      estimatedDelivery: "Oct 30, 2026",
      total: "PKR 5,999",
      items: 1,
      timeline: [
        { label: "Order Placed", date: "Oct 26", done: true },
        { label: "Confirmed", date: "Oct 26", done: true, current: true },
        { label: "Processing", date: "Pending", done: false },
        { label: "Shipped", date: "Pending", done: false },
        { label: "Out for Delivery", date: "Pending", done: false },
        { label: "Delivered", date: "Pending", done: false }
      ]
    }
  ];

  return (
    <div className="account-track-order">
      <div className="page-header">
        <h1>Track Orders</h1>
        <p>Follow the journey of your AURA pieces, from our studio to your door.</p>
      </div>

      {activeOrders.length === 0 ? (
        <div className="empty-state">
          <FiPackage size={48} className="empty-icon" />
          <h3>No active orders</h3>
          <p>You don't have any orders in transit right now.</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Start Shopping</Link>
        </div>
      ) : (
        <div className="tracking-list">
          {activeOrders.map(order => (
            <div key={order.id} className="tracking-card">
              
              {/* Header */}
              <div className="tracking-card-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p>Placed on {order.date}</p>
                </div>
                <div className="tracking-status-badge">
                  <FiTruck /> {order.status}
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="estimated-delivery">
                <FiClock />
                <span>Estimated Delivery: <strong>{order.estimatedDelivery}</strong></span>
              </div>

              {/* Mini Timeline */}
              <div className="mini-timeline">
                {order.timeline.map((step, index) => (
                  <div key={index} className={`mini-step ${step.done ? 'done' : ''} ${step.current ? 'current' : ''}`}>
                    <div className="mini-dot">
                      {step.done ? <FiCheckCircle /> : <div className="empty-dot" />}
                    </div>
                    <span className="mini-label">{step.label}</span>
                    <span className="mini-date">{step.date}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="tracking-card-footer">
                <div className="order-total">
                  <span>Total: <strong>{order.total}</strong></span>
                  <span className="items-count">{order.items} {order.items === 1 ? 'Item' : 'Items'}</span>
                </div>
                <div className="tracking-actions">
                  <Link to={`/account/orders/${order.id}`} className="btn-secondary">View Details</Link>
                  <Link to="/track-order" className="btn-primary">Full Tracking <FiChevronRight /></Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountTrackOrder;