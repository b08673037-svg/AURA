import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiUsers,
  FiUserPlus,
  FiShoppingBag,
  FiDollarSign,
  FiRefreshCw,
  FiEye,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiX,
  FiPackage,
  FiArrowUpRight,
  FiFilter,
  FiChevronDown,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiAlertTriangle,
} from "react-icons/fi";

import { onValue, ref, update, remove } from "firebase/database";
import { db } from "../../services/firebase";
import "./AdminCustomers.css";

const formatPKR = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

const getDate = (value) => {
  if (!value) return null;
  if (typeof value === "number") return new Date(value < 1e12 ? value * 1000 : value);
  if (typeof value === "object" && value.seconds) return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = getDate(value);
  if (!date) return "Not available";
  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOrderAmount = (order) =>
  Number(order.totalAmount ?? order.grandTotal ?? order.total ?? order.amount ?? 0);

const getOrderStatus = (order) =>
  String(order.status || order.orderStatus || "").toLowerCase();

const isRevenueOrder = (order) => {
  const status = getOrderStatus(order);
  const payment = String(order.paymentStatus || "").toLowerCase();
  if (["cancelled", "canceled", "refunded", "failed"].includes(status)) return false;
  if (["cancelled", "canceled", "refunded", "failed"].includes(payment)) return false;
  return (
    ["completed", "delivered", "paid"].includes(status) ||
    ["paid", "completed"].includes(payment)
  );
};

const getOrderDate = (order) =>
  getDate(order.createdAt ?? order.orderDate ?? order.date ?? order.timestamp);

// Works with both { users/{uid}: {...} } and { users/{uid}/profile: {...} }
const normalizeUser = (id, raw) => {
  if (!raw || typeof raw !== "object") return { id, uid: id };
  const profile = raw.profile && typeof raw.profile === "object" ? raw.profile : {};
  return {
    ...raw,
    ...profile,
    id,
    uid: raw.uid || profile.uid || id,
    addresses: raw.addresses || profile.addresses || null,
  };
};

const getCustomerName = (customer) => {
  const direct = customer.name || customer.fullName || customer.displayName || customer.username;
  if (direct) return direct;
  const combined = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
  return combined || "Unnamed Customer";
};

const getCustomerEmail = (customer) => customer.email || customer.emailAddress || "";
const getCustomerPhone = (customer) => customer.phone || customer.phoneNumber || customer.mobile || "";

const getCustomerInitials = (name) =>
  String(name || "A")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const getOrderCustomerEmail = (order) =>
  String(
    order.customerInfo?.email || order.customerEmail || order.email || order.shippingAddress?.email || ""
  ).toLowerCase();

const getOrderCustomerPhone = (order) =>
  String(
    order.customerInfo?.phone || order.customerPhone || order.phone || order.shippingAddress?.phone || ""
  ).replace(/\s+/g, "");

const getOrderCustomerId = (order) =>
  String(order.userId || order.customerId || order.userUid || order.uid || "");

function CustomerStatus({ customer, orders }) {
  const hasOrders = orders.length > 0;
  const created = getDate(customer.createdAt || customer.registeredAt || customer.joinedAt);
  const isNew = created && Date.now() - created.getTime() <= 30 * 24 * 60 * 60 * 1000;
  const label = !hasOrders ? "No Orders" : isNew ? "New Customer" : "Active Buyer";
  const className = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <span className={`customer-status customer-status-${className}`}>
      <i />
      {label}
    </span>
  );
}

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Edit / delete state
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let customersLoaded = false;
    let ordersLoaded = false;
    const checkLoading = () => {
      if (customersLoaded && ordersLoaded) setLoading(false);
    };

    const unsubscribeCustomers = onValue(
      ref(db, "users"),
      (snapshot) => {
        const data = snapshot.val();
        const formatted = data
          ? Object.entries(data).map(([id, customer]) => normalizeUser(id, customer))
          : [];
        setCustomers(formatted);
        customersLoaded = true;
        checkLoading();
        setError("");
      },
      (firebaseError) => {
        console.error("Customer loading error:", firebaseError);
        setError("Unable to load customers. Check your Firebase database permissions.");
        setLoading(false);
      }
    );

    const unsubscribeOrders = onValue(
      ref(db, "orders"),
      (snapshot) => {
        const data = snapshot.val();
        const formatted = data
          ? Object.entries(data).map(([id, order]) => ({ ...order, id }))
          : [];
        setOrders(formatted);
        ordersLoaded = true;
        checkLoading();
      },
      (firebaseError) => {
        console.error("Customer orders error:", firebaseError);
        ordersLoaded = true;
        checkLoading();
      }
    );

    return () => {
      unsubscribeCustomers();
      unsubscribeOrders();
    };
  }, []);

  const customerInsights = useMemo(() => {
    return customers.map((customer) => {
      const email = getCustomerEmail(customer).toLowerCase();
      const phone = getCustomerPhone(customer).replace(/\s+/g, "");
      const uid = String(customer.uid || customer.id);

      const customerOrders = orders.filter((order) => {
        const orderEmail = getOrderCustomerEmail(order);
        const orderPhone = getOrderCustomerPhone(order);
        const orderUid = getOrderCustomerId(order);
        if (uid && orderUid && uid === orderUid) return true;
        if (email && orderEmail && email === orderEmail) return true;
        if (phone && orderPhone && phone === orderPhone) return true;
        return false;
      });

      const revenueOrders = customerOrders.filter(isRevenueOrder);
      const totalSpent = revenueOrders.reduce((sum, order) => sum + getOrderAmount(order), 0);
      const createdAt = customer.createdAt || customer.registeredAt || customer.joinedAt || null;
      const lastOrder = [...customerOrders].sort(
        (a, b) => (getOrderDate(b)?.getTime() || 0) - (getOrderDate(a)?.getTime() || 0)
      )[0];

      return {
        ...customer,
        customerName: getCustomerName(customer),
        customerEmail: email,
        customerPhone: phone,
        customerOrders,
        totalOrders: customerOrders.length,
        revenueOrders: revenueOrders.length,
        totalSpent,
        createdAt,
        lastOrderDate: lastOrder ? getOrderDate(lastOrder) : null,
      };
    });
  }, [customers, orders]);

  const stats = useMemo(() => {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const newCustomers = customerInsights.filter((c) => {
      const date = getDate(c.createdAt);
      return date && now - date.getTime() <= thirtyDays && date.getTime() <= now;
    }).length;
    const activeBuyers = customerInsights.filter((c) => c.totalOrders > 0).length;
    const totalRevenue = customerInsights.reduce((sum, c) => sum + c.totalSpent, 0);
    return { total: customerInsights.length, newCustomers, activeBuyers, totalRevenue };
  }, [customerInsights]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customerInsights
      .filter((customer) => {
        const matchesSearch =
          customer.customerName.toLowerCase().includes(term) ||
          customer.customerEmail.includes(term) ||
          customer.customerPhone.toLowerCase().includes(term);
        let matchesFilter = true;
        if (filter === "Active Buyers") matchesFilter = customer.totalOrders > 0;
        else if (filter === "New Customers") {
          const date = getDate(customer.createdAt);
          matchesFilter = !!date && Date.now() - date.getTime() <= 30 * 24 * 60 * 60 * 1000;
        } else if (filter === "No Orders") {
          matchesFilter = customer.totalOrders === 0;
        }
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customerInsights, search, filter]);

  const topCustomers = useMemo(() => {
    return [...customerInsights]
      .filter((c) => c.totalSpent > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }, [customerInsights]);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 600);
  };

  // ---- EDIT ----
  const openEdit = (customer) => {
    setEditTarget(customer);
    setEditForm({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      phone: customer.phone || customer.phoneNumber || customer.mobile || "",
    });
    setEditError("");
  };

  const closeEdit = () => {
    if (saving) return;
    setEditTarget(null);
    setEditForm({ firstName: "", lastName: "", phone: "" });
    setEditError("");
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editTarget || saving) return;
    if (!editForm.firstName.trim()) {
      setEditError("First name is required.");
      return;
    }
    try {
      setSaving(true);
      const uid = editTarget.uid || editTarget.id;
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone.trim(),
        updatedAt: new Date().toISOString(),
      };
      // Write to both possible DB shapes so either reader stays consistent
      await update(ref(db, `users/${uid}`), payload);
      await update(ref(db, `users/${uid}/profile`), payload);
      setEditTarget(null);
      setEditForm({ firstName: "", lastName: "", phone: "" });
    } catch (err) {
      console.error("Update customer error:", err);
      setEditError("Could not save changes. Check Firebase permissions.");
    } finally {
      setSaving(false);
    }
  };

  // ---- DELETE ----
  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    try {
      setDeleting(true);
      const uid = deleteTarget.uid || deleteTarget.id;
      await remove(ref(db, `users/${uid}`));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete customer error:", err);
      window.alert("Could not delete this customer. Check Firebase permissions.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="customers-page">
      <header className="customers-heading">
        <div>
          <span className="customers-eyebrow">AURA / RELATIONSHIPS</span>
          <h1>Customer Insights</h1>
          <p>Understand your community, discover valuable customers, and build stronger relationships with every purchase.</p>
        </div>
        <button className="customers-refresh-btn" type="button" onClick={handleRefresh}>
          <FiRefreshCw className={refreshing ? "customers-spinning" : ""} />
          Refresh
        </button>
      </header>

      <section className="customers-stats">
        <article className="customer-stat-card">
          <div className="customer-stat-top">
            <span>Total Customers</span>
            <div className="customer-stat-icon stat-icon-dark"><FiUsers /></div>
          </div>
          <strong>{stats.total.toLocaleString()}</strong>
          <small>Registered customer accounts</small>
        </article>
        <article className="customer-stat-card">
          <div className="customer-stat-top">
            <span>New Customers</span>
            <div className="customer-stat-icon stat-icon-gold"><FiUserPlus /></div>
          </div>
          <strong>{stats.newCustomers.toLocaleString()}</strong>
          <small>Joined in the last 30 days</small>
        </article>
        <article className="customer-stat-card">
          <div className="customer-stat-top">
            <span>Active Buyers</span>
            <div className="customer-stat-icon stat-icon-green"><FiShoppingBag /></div>
          </div>
          <strong>{stats.activeBuyers.toLocaleString()}</strong>
          <small>Customers with an order</small>
        </article>
        <article className="customer-stat-card customer-revenue-card">
          <div className="customer-stat-top">
            <span>Customer Revenue</span>
            <div className="customer-stat-icon stat-icon-burgundy"><FiDollarSign /></div>
          </div>
          <strong>{formatPKR(stats.totalRevenue)}</strong>
          <small>Revenue from qualifying paid orders</small>
        </article>
      </section>

      <section className="customer-highlights">
        <div className="customer-highlights-heading">
          <div>
            <span className="customers-eyebrow">CUSTOMER VALUE</span>
            <h2>Top Customers</h2>
            <p>Your highest-spending customers, ranked by recorded revenue.</p>
          </div>
          <span className="customer-highlight-label">TOP 5</span>
        </div>
        {topCustomers.length === 0 ? (
          <div className="customer-highlights-empty">
            <FiUsers />
            <span>Customer purchase insights will appear here when paid orders are recorded.</span>
          </div>
        ) : (
          <div className="top-customer-grid">
            {topCustomers.map((customer, index) => (
              <button
                type="button"
                className="top-customer-card"
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
              >
                <span className="top-customer-rank">#{index + 1}</span>
                <span className="top-customer-avatar">{getCustomerInitials(customer.customerName)}</span>
                <strong>{customer.customerName}</strong>
                <small>{customer.totalOrders} orders</small>
                <b>{formatPKR(customer.totalSpent)}</b>
                <span className="top-customer-link">View profile <FiArrowUpRight /></span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="customer-directory">
        <div className="customer-directory-heading">
          <div>
            <span className="customers-eyebrow">CUSTOMER DATABASE</span>
            <h2>All Customers</h2>
          </div>
          <span className="customer-count">{filteredCustomers.length} customers</span>
        </div>

        <div className="customer-toolbar">
          <div className="customer-search">
            <FiSearch />
            <input
              type="search"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="customer-filter">
            <FiFilter />
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option>All</option>
              <option>Active Buyers</option>
              <option>New Customers</option>
              <option>No Orders</option>
            </select>
            <FiChevronDown />
          </div>
        </div>

        <div className="customer-table-card">
          {loading ? (
            <div className="customer-state">
              <div className="customer-loader" />
              <h3>Loading customers</h3>
              <p>Gathering customer profiles and purchase records...</p>
            </div>
          ) : error ? (
            <div className="customer-state">
              <FiUsers className="customer-state-icon" />
              <h3>Unable to load customers</h3>
              <p>{error}</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="customer-state">
              <div className="customer-state-icon"><FiUsers /></div>
              <h3>No customers found</h3>
              <p>
                {customers.length
                  ? "Try another search term or change the selected filter."
                  : "Registered customers will appear here once available."}
              </p>
              {(search || filter !== "All") && (
                <button
                  className="customer-clear-btn"
                  type="button"
                  onClick={() => { setSearch(""); setFilter("All"); }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="customer-table-scroll">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Joined</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Last Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-identity">
                          <div className="customer-avatar">
                            {customer.photoURL || customer.avatar ? (
                              <img src={customer.photoURL || customer.avatar} alt={customer.customerName} />
                            ) : (
                              getCustomerInitials(customer.customerName)
                            )}
                          </div>
                          <div>
                            <strong>{customer.customerName}</strong>
                            <small>{customer.customerEmail || "No email"}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className="customer-contact">{customer.customerPhone || "Not provided"}</span></td>
                      <td><span className="customer-date">{formatDate(customer.createdAt)}</span></td>
                      <td><strong className="customer-order-count">{customer.totalOrders}</strong></td>
                      <td><strong className="customer-spent">{formatPKR(customer.totalSpent)}</strong></td>
                      <td>
                        <span className="customer-date">
                          {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : "No orders"}
                        </span>
                      </td>
                      <td>
                        <CustomerStatus customer={customer} orders={customer.customerOrders} />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="customer-view-btn"
                            type="button"
                            title="View customer profile"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <FiEye />
                          </button>
                          <button
                            className="customer-view-btn"
                            type="button"
                            title="Edit customer"
                            onClick={() => openEdit(customer)}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="customer-view-btn"
                            type="button"
                            title="Delete customer"
                            style={{ color: "#b55353" }}
                            onClick={() => setDeleteTarget(customer)}
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
          {!loading && !error && filteredCustomers.length > 0 && (
            <div className="customer-table-footer">
              <span>Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> customers</span>
              <span className="customer-live-indicator"><i /> Live database sync</span>
            </div>
          )}
        </div>
      </section>

      {/* VIEW MODAL */}
      {selectedCustomer && (
        <div className="customer-modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="customer-modal" onClick={(event) => event.stopPropagation()}>
            <div className="customer-modal-header">
              <div>
                <span className="customers-eyebrow">CUSTOMER PROFILE</span>
                <h2>Customer Details</h2>
              </div>
              <button className="customer-modal-close" onClick={() => setSelectedCustomer(null)} aria-label="Close">
                <FiX />
              </button>
            </div>
            <div className="customer-profile">
              <div className="customer-profile-avatar">
                {selectedCustomer.photoURL || selectedCustomer.avatar ? (
                  <img src={selectedCustomer.photoURL || selectedCustomer.avatar} alt={selectedCustomer.customerName} />
                ) : (
                  getCustomerInitials(selectedCustomer.customerName)
                )}
              </div>
              <div className="customer-profile-info">
                <h3>{selectedCustomer.customerName}</h3>
                <p>Customer since {formatDate(selectedCustomer.createdAt)}</p>
                <CustomerStatus customer={selectedCustomer} orders={selectedCustomer.customerOrders} />
              </div>
            </div>
            <div className="customer-profile-stats">
              <div><span>Total Orders</span><strong>{selectedCustomer.totalOrders}</strong></div>
              <div><span>Total Spent</span><strong>{formatPKR(selectedCustomer.totalSpent)}</strong></div>
              <div><span>Paid Orders</span><strong>{selectedCustomer.revenueOrders}</strong></div>
            </div>
            <div className="customer-contact-details">
              <h4>Contact Information</h4>
              <div><FiMail /><span>{selectedCustomer.customerEmail || "No email provided"}</span></div>
              <div><FiPhone /><span>{selectedCustomer.customerPhone || "No phone provided"}</span></div>
              <div>
                <FiMapPin />
                <span>{selectedCustomer.address || selectedCustomer.city || "Address not provided"}</span>
              </div>
              <div><FiCalendar /><span>Registered {formatDate(selectedCustomer.createdAt)}</span></div>
            </div>
            <div className="customer-order-history">
              <div className="customer-order-history-heading">
                <h4>Order History</h4>
                <span>{selectedCustomer.customerOrders.length} orders</span>
              </div>
              {selectedCustomer.customerOrders.length === 0 ? (
                <div className="customer-no-orders">
                  <FiPackage />
                  <span>This customer has not placed an order yet.</span>
                </div>
              ) : (
                <div className="customer-order-list">
                  {[...selectedCustomer.customerOrders]
                    .sort((a, b) => (getOrderDate(b)?.getTime() || 0) - (getOrderDate(a)?.getTime() || 0))
                    .slice(0, 6)
                    .map((order) => (
                      <div className="customer-order-item" key={order.id}>
                        <div>
                          <strong>{order.orderNumber || order.id}</strong>
                          <small>{formatDate(getOrderDate(order))}</small>
                        </div>
                        <div className="customer-order-item-right">
                          <strong>{formatPKR(getOrderAmount(order))}</strong>
                          <small>{order.status || order.orderStatus || "Pending"}</small>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editTarget && (
        <div
          className="customer-modal-overlay"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <form
            className="customer-modal"
            onSubmit={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="customer-modal-header">
              <div>
                <span className="customers-eyebrow">EDIT CUSTOMER</span>
                <h2>{editTarget.customerName}</h2>
              </div>
              <button type="button" className="customer-modal-close" onClick={closeEdit} aria-label="Close">
                <FiX />
              </button>
            </div>

            <div style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: 700 }}>
                  First Name
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    style={{ padding: "10px 12px", border: "1px solid #eae5de", borderRadius: "4px", fontSize: "12px" }}
                    required
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: 700 }}>
                  Last Name
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    style={{ padding: "10px 12px", border: "1px solid #eae5de", borderRadius: "4px", fontSize: "12px" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: 700 }}>
                  Phone
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ padding: "10px 12px", border: "1px solid #eae5de", borderRadius: "4px", fontSize: "12px" }}
                  />
                </label>
              </div>

              {editError && (
                <p style={{ marginTop: "12px", color: "#b55353", fontSize: "11px" }}>
                  <FiAlertTriangle /> {editError}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  style={{ padding: "10px 16px", border: "1px solid #eae5de", background: "#fff", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: "10px 16px", border: "1px solid #252525", background: "#252525", color: "#fff", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <FiSave /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div
          className="customer-modal-overlay"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !deleting) setDeleteTarget(null); }}
        >
          <div
            className="customer-modal"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="customer-modal-header">
              <div>
                <span className="customers-eyebrow">DELETE CUSTOMER</span>
                <h2>Are you sure?</h2>
              </div>
              <button
                type="button"
                className="customer-modal-close"
                onClick={() => !deleting && setDeleteTarget(null)}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>
            <div style={{ padding: "22px 24px" }}>
              <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#625d57", margin: 0 }}>
                This will remove <strong>{deleteTarget.customerName}</strong> from your customer database.
                Their login account will still exist in Firebase Auth, but their profile will be deleted.
                This cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  style={{ padding: "10px 16px", border: "1px solid #eae5de", background: "#fff", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ padding: "10px 16px", border: "1px solid #b55353", background: "#b55353", color: "#fff", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <FiTrash2 /> {deleting ? "Deleting..." : "Delete Customer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;