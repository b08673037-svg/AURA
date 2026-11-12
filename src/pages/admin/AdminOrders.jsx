import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiEye,
  FiX,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiCreditCard,
  FiPackage,
  FiChevronDown,
  FiFilter,
  FiAlertCircle,
  FiTrash2,
} from "react-icons/fi";

import { onValue, ref, update, remove } from "firebase/database";
import { db } from "../../services/firebase";
import "./AdminOrders.css";

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Paid", "Pending", "Failed", "Refunded"];

const formatPKR = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  let date;
  if (typeof value === "number") date = new Date(value < 1000000000000 ? value * 1000 : value);
  else date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
};

const getOrderDate = (order) =>
  order.createdAt || order.orderDate || order.date || order.timestamp || null;

const getOrderAmount = (order) =>
  Number(order.totalAmount ?? order.grandTotal ?? order.total ?? order.amount ?? 0);

const normalizeStatus = (value) => {
  const status = String(value || "Pending").toLowerCase();
  const matched = ORDER_STATUSES.find((item) => item.toLowerCase() === status);
  return matched || "Pending";
};

const normalizePaymentStatus = (order) => {
  const value = String(order.paymentStatus || order.payment?.status || "").toLowerCase();
  if (value.includes("refund")) return "Refunded";
  if (value.includes("fail")) return "Failed";
  if (value.includes("paid")) return "Paid";
  return "Pending";
};

const getCustomerName = (order) => {
  if (order.customerInfo) {
    const fullName = `${order.customerInfo.firstName || ""} ${order.customerInfo.lastName || ""}`.trim();
    if (fullName) return fullName;
  }
  return (
    order.customerName || order.customer?.name ||
    order.shippingAddress?.name || order.name || "Guest Customer"
  );
};

const getCustomerEmail = (order) =>
  order.customerInfo?.email || order.customerEmail || order.customer?.email || order.email || "";

const getCustomerPhone = (order) =>
  order.customerInfo?.phone || order.customerPhone || order.customer?.phone ||
  order.shippingAddress?.phone || order.phone || "";

const getOrderItems = (order) => {
  const items = order.items || order.products || [];
  if (Array.isArray(items)) return items;
  if (items && typeof items === "object") return Object.values(items);
  return [];
};

const getItemName = (item) => item.name || item.productName || item.title || "Product";
const getItemPrice = (item) =>
  Number(item.price ?? item.unitPrice ?? item.salePrice ?? item.productPrice ?? 0);
const getItemQuantity = (item) => Number(item.quantity || item.qty || 1);

const getShippingAddress = (order) => {
  const address =
    order.deliveryAddress || order.shippingAddress || order.address || order.customer?.address || {};
  if (typeof address === "string") return address;
  return (
    [address.address || address.street, address.city, address.state, address.postalCode, address.country]
      .filter(Boolean)
      .join(", ") || "Address not provided"
  );
};

const getPaymentMethod = (order) =>
  order.paymentMethod || order.payment?.method || "Not specified";

function StatusBadge({ status }) {
  const className = status.toLowerCase().replace(/\s+/g, "-");
  return (
    <span className={`order-status-badge status-${className}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function PaymentBadge({ status }) {
  const className = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`payment-badge payment-${className}`}>{status}</span>;
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const ordersRef = ref(db, "orders");
    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setOrders([]);
          setLoading(false);
          setError("");
          return;
        }
        const formattedOrders = Object.entries(data).map(([id, order]) => ({
          ...order,
          id,
          status: normalizeStatus(order.status || order.orderStatus),
        }));
        formattedOrders.sort((a, b) => {
          const dateA = new Date(getOrderDate(a) || 0).getTime();
          const dateB = new Date(getOrderDate(b) || 0).getTime();
          return dateB - dateA;
        });
        setOrders(formattedOrders);
        setLoading(false);
        setError("");
      },
      (firebaseError) => {
        console.error("Orders loading error:", firebaseError);
        setError("Unable to load orders. Check your Firebase permissions.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    processing: orders.filter((o) => o.status === "Processing").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    cancelled: orders.filter((o) => o.status === "Cancelled").length,
    revenue: orders
      .filter((o) => normalizePaymentStatus(o) === "Paid" && o.status !== "Cancelled")
      .reduce((sum, order) => sum + getOrderAmount(order), 0),
  }), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customer = getCustomerName(order).toLowerCase();
      const orderId = String(order.orderNumber || order.id).toLowerCase();
      const email = getCustomerEmail(order).toLowerCase();
      const searchValue = search.toLowerCase();
      const matchesSearch =
        orderId.includes(searchValue) || customer.includes(searchValue) || email.includes(searchValue);
      const matchesStatus = statusFilter === "All" || order.status === statusFilter;
      const paymentStatus = normalizePaymentStatus(order);
      const matchesPayment = paymentFilter === "All" || paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 600);
  };

  const handleStatusUpdate = async (order, newStatus) => {
    if (!order?.id || updating) return;

    try {
      setUpdating(true);

      // Automatically mark as Paid if Delivered (since it's COD)
      const updates = {
        status: newStatus,
        orderStatus: newStatus,
        updatedAt: new Date().toISOString(),
      };

      if (newStatus === "Delivered") {
        updates.paymentStatus = "Paid";
      }

      await update(ref(db, `orders/${order.id}`), updates);

      setSelectedOrder((current) =>
        current
          ? { ...current, status: newStatus, paymentStatus: updates.paymentStatus || current.paymentStatus }
          : current
      );
    } catch (updateError) {
      console.error("Order status update error:", updateError);
      window.alert(
        "Could not update order status. Please check Firebase permissions."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    try {
      setDeleting(true);
      await remove(ref(db, `orders/${deleteTarget.id}`));
      // If the modal was open on this order, close it
      if (selectedOrder?.id === deleteTarget.id) setSelectedOrder(null);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete order error:", err);
      window.alert("Could not delete this order. Check Firebase permissions.");
    } finally {
      setDeleting(false);
    }
  };

  const getDisplayOrderId = (order) => order.orderNumber || order.id?.slice(-8).toUpperCase();

  return (
    <div className="orders-page">
      <div className="orders-heading">
        <div>
          <span className="orders-eyebrow">AURA / OPERATIONS</span>
          <h1>Order Management</h1>
          <p>Manage customer orders, monitor fulfillment, and keep every delivery on track.</p>
        </div>
        <button className="orders-refresh-btn" onClick={handleRefresh} type="button">
          <FiRefreshCw className={refreshing ? "is-spinning" : ""} />
          Refresh
        </button>
      </div>

      <section className="orders-stats-grid">
        <div className="order-stat-card">
          <div className="order-stat-top"><span>Total Orders</span><span className="order-stat-icon charcoal-icon"><FiShoppingBag /></span></div>
          <strong>{stats.total.toLocaleString()}</strong>
          <small>All received orders</small>
        </div>
        <div className="order-stat-card">
          <div className="order-stat-top"><span>Pending</span><span className="order-stat-icon amber-icon"><FiClock /></span></div>
          <strong>{stats.pending.toLocaleString()}</strong>
          <small>Awaiting confirmation</small>
        </div>
        <div className="order-stat-card">
          <div className="order-stat-top"><span>Processing</span><span className="order-stat-icon blue-icon"><FiPackage /></span></div>
          <strong>{stats.processing.toLocaleString()}</strong>
          <small>Being prepared</small>
        </div>
        <div className="order-stat-card">
          <div className="order-stat-top"><span>Delivered</span><span className="order-stat-icon green-icon"><FiCheckCircle /></span></div>
          <strong>{stats.delivered.toLocaleString()}</strong>
          <small>Successfully delivered</small>
        </div>
        <div className="order-stat-card">
          <div className="order-stat-top"><span>Paid Revenue</span><span className="order-stat-icon burgundy-icon"><FiCreditCard /></span></div>
          <strong className="revenue-stat-value">{formatPKR(stats.revenue)}</strong>
          <small>Paid orders, excluding cancelled</small>
        </div>
      </section>

      <section className="orders-toolbar">
        <div className="orders-toolbar-title">
          <div>
            <span className="orders-eyebrow">ORDER DIRECTORY</span>
            <h2>All Orders</h2>
          </div>
          <span className="orders-count">{filteredOrders.length} results</span>
        </div>
        <div className="orders-controls">
          <div className="orders-search">
            <FiSearch />
            <input type="search" placeholder="Search order, customer, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="orders-filter">
            <FiFilter />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <FiChevronDown className="filter-chevron" />
          </div>
          <div className="orders-filter">
            <FiCreditCard />
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="All">All payments</option>
              {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <FiChevronDown className="filter-chevron" />
          </div>
        </div>
      </section>

      <section className="orders-table-card">
        {loading ? (
          <div className="orders-state">
            <div className="orders-loader" />
            <h3>Loading orders</h3>
            <p>Connecting to your order database...</p>
          </div>
        ) : error ? (
          <div className="orders-state">
            <FiAlertCircle className="state-error-icon" />
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-state">
            <div className="orders-empty-icon"><FiShoppingBag /></div>
            <h3>No orders found</h3>
            <p>{orders.length ? "Try changing your search or filters." : "New customer orders will appear here."}</p>
            {(search || statusFilter !== "All" || paymentFilter !== "All") && (
              <button
                className="orders-clear-btn"
                onClick={() => { setSearch(""); setStatusFilter("All"); setPaymentFilter("All"); }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="orders-table-scroll">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td><span className="order-id">#{getDisplayOrderId(order)}</span></td>
                    <td>
                      <div className="order-customer">
                        <div className="customer-avatar">{getCustomerName(order).charAt(0).toUpperCase()}</div>
                        <div>
                          <strong>{getCustomerName(order)}</strong>
                          <small>{getCustomerEmail(order) || "No email"}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="order-date">{formatDate(getOrderDate(order))}</span></td>
                    <td>
                      <span className="order-items-count">
                        {getOrderItems(order).reduce((sum, item) => sum + getItemQuantity(item), 0)} items
                      </span>
                    </td>
                    <td><strong className="order-total">{formatPKR(getOrderAmount(order))}</strong></td>
                    <td><PaymentBadge status={normalizePaymentStatus(order)} /></td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="order-view-btn"
                          onClick={() => setSelectedOrder(order)}
                          title="View order details"
                          type="button"
                        >
                          <FiEye />
                        </button>
                        <button
                          className="order-view-btn"
                          onClick={() => setDeleteTarget(order)}
                          title="Delete order"
                          type="button"
                          style={{ color: "#b55353" }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="orders-table-footer">
            <span>Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders</span>
            <span className="orders-live-indicator"><span /> Live database sync</span>
          </div>
        )}
      </section>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => !updating && setSelectedOrder(null)}>
          <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <div>
                <span className="orders-eyebrow">ORDER DETAILS</span>
                <h2>#{getDisplayOrderId(selectedOrder)}</h2>
                <p>Placed on {formatDate(getOrderDate(selectedOrder))}</p>
              </div>
              <button className="order-modal-close" onClick={() => setSelectedOrder(null)} type="button" aria-label="Close order details">
                <FiX />
              </button>
            </div>
            <div className="order-modal-body">
              <div className="order-detail-grid">
                <div className="order-detail-panel">
                  <h3><FiShoppingBag /> Customer Information</h3>
                  <strong>{getCustomerName(selectedOrder)}</strong>
                  <p><FiMail />{getCustomerEmail(selectedOrder) || "Not provided"}</p>
                  <p><FiPhone />{getCustomerPhone(selectedOrder) || "Not provided"}</p>
                </div>
                <div className="order-detail-panel">
                  <h3><FiMapPin /> Delivery Address</h3>
                  <p className="address-text">{getShippingAddress(selectedOrder)}</p>
                </div>
                <div className="order-detail-panel">
                  <h3><FiCreditCard /> Payment Information</h3>
                  <p>Method: <strong>{getPaymentMethod(selectedOrder)}</strong></p>
                  <p>Payment: <PaymentBadge status={normalizePaymentStatus(selectedOrder)} /></p>
                </div>
                <div className="order-detail-panel">
                  <h3><FiCalendar /> Order Summary</h3>
                  <p>Items: <strong>{getOrderItems(selectedOrder).length}</strong></p>
                  <p>Total: <strong>{formatPKR(getOrderAmount(selectedOrder))}</strong></p>
                </div>
              </div>
              <div className="order-products-section">
                <h3>Ordered Products</h3>
                {getOrderItems(selectedOrder).length === 0 ? (
                  <p className="no-order-items">No product details were found for this order.</p>
                ) : (
                  <div className="order-products-list">
                    {getOrderItems(selectedOrder).map((item, index) => (
                      <div className="order-product-row" key={item.id || item.productId || index}>
                        <div className="order-product-image">
                          {item.image || item.imageUrl ? (
                            <img src={item.image || item.imageUrl} alt={getItemName(item)} />
                          ) : (
                            <FiPackage />
                          )}
                        </div>
                        <div className="order-product-info">
                          <strong>{getItemName(item)}</strong>
                          <span>Qty: {getItemQuantity(item)}</span>
                        </div>
                        <strong>{formatPKR(getItemPrice(item) * getItemQuantity(item))}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="order-status-editor">
                <div>
                  <h3>Update Order Status</h3>
                  <p>Changes will be saved to Firebase immediately.</p>
                </div>
                <select
                  value={selectedOrder.status}
                  disabled={updating}
                  onChange={(e) => handleStatusUpdate(selectedOrder, e.target.value)}
                >
                  {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              {updating && <p className="order-update-message">Saving order status...</p>}
            </div>
            <div className="order-modal-footer" style={{ gap: "8px" }}>
              <button
                type="button"
                className="order-modal-done"
                style={{ background: "#fff", color: "#b55353", border: "1px solid #b55353" }}
                onClick={() => setDeleteTarget(selectedOrder)}
                disabled={updating}
              >
                <FiTrash2 style={{ marginRight: 6 }} /> Delete Order
              </button>
              <button className="order-modal-done" onClick={() => setSelectedOrder(null)} type="button" disabled={updating}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div
          className="order-modal-overlay"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="order-details-modal"
            style={{ maxWidth: "460px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-modal-header">
              <div>
                <span className="orders-eyebrow">DELETE ORDER</span>
                <h2>Are you sure?</h2>
                <p>Order #{getDisplayOrderId(deleteTarget)}</p>
              </div>
              <button
                className="order-modal-close"
                onClick={() => !deleting && setDeleteTarget(null)}
                type="button"
              >
                <FiX />
              </button>
            </div>
            <div className="order-modal-body">
              <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#625d57", margin: 0 }}>
                This will permanently delete this order from the database. It will be removed from customer
                history and revenue reports. This action cannot be undone.
              </p>
            </div>
            <div className="order-modal-footer" style={{ gap: "8px" }}>
              <button
                type="button"
                className="order-modal-done"
                style={{ background: "#fff", color: "#625d57", border: "1px solid #e4ddd4" }}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="order-modal-done"
                style={{ background: "#b55353", borderColor: "#b55353" }}
                onClick={handleDelete}
                disabled={deleting}
              >
                <FiTrash2 style={{ marginRight: 6 }} />
                {deleting ? "Deleting..." : "Delete Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;