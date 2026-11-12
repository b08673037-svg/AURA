import { useEffect, useMemo, useState } from "react";
import { onValue, ref, remove } from "firebase/database";
import { db } from "../../services/firebase";
import {
  FiTrendingUp, FiShoppingBag, FiUsers,
  FiDollarSign, FiPackage, FiArrowUpRight, FiArrowDownRight,
  FiRefreshCw, FiAlertCircle, FiArrowRight,
  FiTrash2, FiX,
} from "react-icons/fi";
import "./AdminDashboard.css";

// Formatting helpers
const currency = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatCompactPKR = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 10000000) return `Rs. ${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(1)}K`;
  return `Rs. ${amount.toFixed(0)}`;
};

// Date helpers
const getDate = (value) => {
  if (!value) return null;
  if (typeof value === "number") return new Date(value < 1e12 ? value * 1000 : value);
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "object" && value.seconds) return new Date(value.seconds * 1000);
  return null;
};

const getOrderTotal = (order) =>
  Number(order.total ?? order.totalAmount ?? order.grandTotal ?? order.amount ?? 0);

const getOrderDate = (order) =>
  getDate(order.createdAt ?? order.orderDate ?? order.date ?? order.timestamp);

const getOrderItems = (order) => {
  const items = order.items || order.products || [];
  if (Array.isArray(items)) return items;
  if (items && typeof items === "object") return Object.values(items);
  return [];
};

const isRevenueOrder = (order) => {
  const status = String(order.status || order.orderStatus || "").toLowerCase();
  const payment = String(order.paymentStatus || "").toLowerCase();
  if (["cancelled", "canceled", "refunded", "failed"].includes(status)) return false;
  if (["cancelled", "canceled", "refunded", "failed"].includes(payment)) return false;
  return true;
};

const isRealOrder = (order) => {
  if (!order || typeof order !== "object") return false;
  return Boolean(
    order.createdAt || order.date || order.timestamp || order.orderDate ||
    order.orderId || order.userId || order.total != null || order.totalAmount != null
  );
};

const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const getInitials = (name = "Customer") =>
  String(name).split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

/* =========================================
   UPGRADED REVENUE CHART
========================================= */
const RevenueChart = ({ data }) => {
  const width = 700;
  const height = 230;
  const paddingLeft = 45;
  const paddingRight = 18;
  const paddingTop = 18;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find maximum value for Y-axis scaling (min 10k so it doesn't look flat when empty)
  const maxValue = Math.max(...data.map((d) => d.value), 10000);
  // Round max up to a nice number (e.g., 50k, 100k)
  const stepValue = Math.ceil(maxValue / 4);
  const yAxisMax = stepValue * 4;

  const points = data.map((item, index) => {
    const x = paddingLeft + (index * chartWidth) / Math.max(data.length - 1, 1);
    const y = height - paddingBottom - (item.value / yAxisMax) * chartHeight;
    return { x, y, ...item };
  });

  // Create a smooth bezier curve path for a premium look
  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      // Control points for smooth curve
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    // Close the path for the gradient area fill
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }

  // Y-axis labels (4 steps)
  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const value = stepValue * (4 - i);
    const y = paddingTop + (i * chartHeight) / 4;
    return { value, y };
  });

  return (
    <div className="revenue-chart" style={{ position: "relative", width: "100%", height: "230px" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="auraRevenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#873b4c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#873b4c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid Lines & Y-Axis Labels */}
        {yLabels.map((label, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              x2={width - paddingRight}
              y1={label.y}
              y2={label.y}
              stroke="#eee9e7"
              strokeDasharray="4 5"
            />
            <text
              x={paddingLeft - 10}
              y={label.y + 3}
              textAnchor="end"
              fill="#9a9096"
              fontSize="10"
              fontFamily="DM Sans, sans-serif"
            >
              {formatCompactPKR(label.value)}
            </text>
          </g>
        ))}

        {/* The Area & Line */}
        {points.length > 0 && (
          <>
            <path d={areaPath} fill="url(#auraRevenueFill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#873b4c"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Data Points (Circles) */}
        {points.map((p) => (
          <g key={p.label} className="chart-point-group">
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#fff"
              stroke="#873b4c"
              strokeWidth="2.5"
              style={{ transition: "r 0.2s ease" }}
            />
            <title>{`${p.label}: ${currency(p.value)}`}</title>
          </g>
        ))}
      </svg>

      {/* X-axis Labels (Months) - Positioned below the SVG */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingLeft: `${(paddingLeft / width) * 100}%`,
          paddingRight: `${(paddingRight / width) * 100}%`,
          marginTop: "5px",
          color: "#9c9399",
          fontSize: "10px",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};

/* ============ DONUT CHART ============ */
const DonutChart = ({ data, totalItems, totalOrders }) => {
  const colors = ["#873b4c", "#c9879b", "#c6a978", "#4a3745", "#ded1c5"];
  let cumulative = 0;
  const segments = data.map((item, index) => {
    const percentage = totalItems > 0 ? (item.value / totalItems) * 100 : 0;
    const segment = { ...item, percentage, color: colors[index % colors.length], offset: cumulative };
    cumulative += percentage;
    return segment;
  });

  return (
    <div className="donut-layout">
      <div className="donut-chart">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="43" fill="none" stroke="#f0ece9" strokeWidth="15" />
          {segments.map((item) => (
            <circle
              key={item.name}
              cx="60" cy="60" r="43"
              fill="none"
              stroke={item.color}
              strokeWidth="15"
              strokeDasharray={`${item.percentage * 2.7018} 270.18`}
              strokeDashoffset={-item.offset * 2.7018}
              transform="rotate(-90 60 60)"
            >
              <title>{`${item.name}: ${item.value} items`}</title>
            </circle>
          ))}
        </svg>
        <div className="donut-center">
          <strong>{totalOrders.toLocaleString()}</strong>
          <span>{totalOrders === 1 ? "Order" : "Orders"}</span>
        </div>
      </div>

      <div className="donut-orders-line">
        <span>Slices represent</span>
        <strong>{totalItems.toLocaleString()} items</strong>
      </div>

      <div className="donut-legend">
        {segments.map((item) => (
          <div className="legend-row" key={item.name}>
            <span className="legend-name"><i style={{ background: item.color }} />{item.name}</span>
            <strong>{Math.round(item.percentage)}% · {item.value} items</strong>
          </div>
        ))}
        {segments.length === 0 && <p className="empty-note">No order data yet.</p>}
      </div>
    </div>
  );
};

/* ============ MAIN DASHBOARD ============ */
const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [period, setPeriod] = useState("30");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ordersLoaded = false;
    let productsLoaded = false;
    let usersLoaded = false;
    let alive = true;

    const finishLoading = () => {
      if (alive && ordersLoaded && productsLoaded && usersLoaded) setLoading(false);
    };

    const subscriptions = [
      { path: "orders", setter: setOrders, done: () => { ordersLoaded = true; finishLoading(); } },
      { path: "products", setter: setProducts, done: () => { productsLoaded = true; finishLoading(); } },
      { path: "users", setter: setUsers, done: () => { usersLoaded = true; finishLoading(); } },
    ];

    const unsubscribers = subscriptions.map(({ path, setter, done }) =>
      onValue(
        ref(db, path),
        (snapshot) => {
          const value = snapshot.val() || {};
          const records = Array.isArray(value)
            ? value.filter(Boolean)
            : Object.entries(value).map(([id, item]) => ({ id, ...(item || {}) }));
          if (alive) { setter(records); done(); }
        },
        (error) => {
          if (alive) {
            setDataError(error.message || "Unable to load dashboard data.");
            done();
          }
        }
      )
    );

    return () => {
      alive = false;
      unsubscribers.forEach((u) => u());
    };
  }, []);

  const dashboard = useMemo(() => {
    const now = new Date();
    const days = Number(period);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - days);

    const realOrders = orders.filter(isRealOrder);
    const validOrders = realOrders.map((order) => ({
      ...order,
      _date: getOrderDate(order),
      _total: getOrderTotal(order),
      _items: getOrderItems(order),
    }));

    const periodOrders = validOrders.filter(
      (o) => o._date && o._date >= start && o._date <= now
    );
    const previousPeriodOrders = validOrders.filter(
      (o) => o._date && o._date >= previousStart && o._date < start
    );

    const periodRevenueOrders = periodOrders.filter(isRevenueOrder);
    const periodRevenue = periodRevenueOrders.reduce((s, o) => s + o._total, 0);
    const previousRevenue = previousPeriodOrders.filter(isRevenueOrder).reduce((s, o) => s + o._total, 0);
    const change = previousRevenue > 0 ? ((periodRevenue - previousRevenue) / previousRevenue) * 100 : null;

    const allTimeOrderCount = validOrders.length;
    const allTimeRevenue = validOrders.filter(isRevenueOrder).reduce((s, o) => s + o._total, 0);

    // Revenue chart - last 6 calendar months
    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = getMonthKey(date);
      const value = validOrders
        .filter((o) => o._date && getMonthKey(o._date) === key && isRevenueOrder(o))
        .reduce((s, o) => s + o._total, 0);
      return { label: monthNames[date.getMonth()], value };
    });

    const categoryTotals = {};
    periodRevenueOrders.forEach((order) => {
      order._items.forEach((item) => {
        const category = item.category || "Uncategorized";
        categoryTotals[category] = (categoryTotals[category] || 0) + Number(item.quantity || 1);
      });
    });
    const categoryData = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    const totalCategoryItems = categoryData.reduce((sum, c) => sum + c.value, 0);

    const productSales = {};
    periodRevenueOrders.forEach((order) => {
      order._items.forEach((item) => {
        const id = item.productId || item.id || item.sku || item.name;
        if (!id) return;
        if (!productSales[id]) {
          productSales[id] = {
            id,
            name: item.name || item.productName || "Unnamed product",
            category: item.category || "General",
            image: item.image || item.imageUrl || null,
            unitsSold: 0,
            revenue: 0,
          };
        }
        const qty = Number(item.quantity || 1);
        const price = Number(item.price || item.unitPrice || 0);
        productSales[id].unitsSold += qty;
        productSales[id].revenue += qty * price;
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const lowStock = products.filter((product) => {
      const stock = Number(product.stock ?? product.quantity ?? 0);
      return stock <= Number(product.lowStockThreshold ?? 5);
    });

    const recentOrders = [...validOrders]
      .filter((o) => o._date)
      .sort((a, b) => b._date - a._date)
      .slice(0, 5);

    const periodAverageOrder = periodRevenueOrders.length
      ? periodRevenue / periodRevenueOrders.length
      : 0;

    return {
      periodRevenue,
      periodOrderCount: periodOrders.length,
      periodChange: change,
      periodAverageOrder,
      allTimeOrderCount,
      allTimeRevenue,
      revenueByMonth,
      categoryData,
      totalCategoryItems,
      topProducts,
      lowStock,
      recentOrders,
      customerCount: users.length,
      productCount: products.length,
    };
  }, [orders, products, users, period]);

  const handleDeleteOrder = async () => {
    if (!deleteTarget || deleting) return;
    try {
      setDeleting(true);
      await remove(ref(db, `orders/${deleteTarget.id}`));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete order error:", err);
      window.alert("Could not delete this order. Check Firebase permissions.");
    } finally {
      setDeleting(false);
    }
  };

  const kpis = [
    {
      title: "Total Orders (All-Time)",
      value: dashboard.allTimeOrderCount.toLocaleString(),
      icon: <FiShoppingBag />,
      detail: `${dashboard.periodOrderCount} in last ${period} days`,
    },
    {
      title: "Total Revenue (All-Time)",
      value: currency(dashboard.allTimeRevenue),
      icon: <FiDollarSign />,
      trend: dashboard.periodChange,
      detail: `${currency(dashboard.periodRevenue)} in last ${period} days`,
    },
    {
      title: "Total Customers",
      value: dashboard.customerCount.toLocaleString(),
      icon: <FiUsers />,
      detail: "Registered customers",
    },
    {
      title: `Avg. Order Value (${period}d)`,
      value: currency(dashboard.periodAverageOrder),
      icon: <FiTrendingUp />,
      detail: "Revenue per valid order in period",
    },
    {
      title: "Total Products",
      value: dashboard.productCount.toLocaleString(),
      icon: <FiPackage />,
      detail: "Products in catalog",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Preparing your AURA business overview...</p>
      </div>
    );
  }

  return (
    <div className="aura-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">AURA COMMERCE INTELLIGENCE</span>
          <h1>Welcome to your command center<span>.</span></h1>
          <p>Your store performance, customer activity and business insights in one place.</p>
        </div>
        <div className="welcome-date">
          <span>REPORTING PERIOD</span>
          <strong>{period} DAYS</strong>
          <small>Live from your store data</small>
        </div>
      </section>

      {dataError && (
        <div className="dashboard-error">
          <FiAlertCircle />
          <span>{dataError} Check your Firebase database rules and connection.</span>
        </div>
      )}

      <section className="dashboard-section-heading">
        <div>
          <span className="eyebrow">STORE PERFORMANCE</span>
          <h2>Business overview</h2>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 12 months</option>
        </select>
      </section>

      <section className="dashboard-kpis">
        {kpis.map((item) => (
          <article className="aura-kpi-card" key={item.title}>
            <div className="kpi-topline">
              <span className="kpi-icon">{item.icon}</span>
              {item.trend !== undefined && item.trend !== null && (
                <span className={`kpi-change ${item.trend >= 0 ? "positive" : "negative"}`}>
                  {item.trend >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
                  {Math.abs(item.trend).toFixed(1)}%
                </span>
              )}
            </div>
            <span className="kpi-heading">{item.title}</span>
            <strong className="kpi-number">{item.value}</strong>
            <span className="kpi-description">{item.detail}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-primary-grid">
        <article className="dashboard-card revenue-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">FINANCIAL PERFORMANCE</span>
              <h3>Revenue overview</h3>
            </div>
            <span className="card-icon"><FiTrendingUp /></span>
          </div>
          <div className="revenue-total">
            <strong>{currency(dashboard.periodRevenue)}</strong>
            {dashboard.periodChange !== null && (
              <span className={dashboard.periodChange >= 0 ? "positive-text" : "negative-text"}>
                {dashboard.periodChange >= 0 ? "+" : ""}
                {dashboard.periodChange.toFixed(1)}% vs previous period
              </span>
            )}
          </div>
          
          <RevenueChart data={dashboard.revenueByMonth} />
          
          <div className="chart-footnote">
            <span><i className="chart-legend-dot" /> Monthly revenue</span>
            <span>Last 6 calendar months</span>
          </div>
        </article>

        <article className="dashboard-card category-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">ITEM BREAKDOWN</span>
              <h3>Category mix</h3>
            </div>
            <span className="card-icon"><FiShoppingBag /></span>
          </div>
          <DonutChart
            data={dashboard.categoryData}
            totalItems={dashboard.totalCategoryItems}
            totalOrders={dashboard.periodOrderCount}
          />
        </article>
      </section>

      <section className="dashboard-secondary-grid">
        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">PRODUCT PERFORMANCE</span>
              <h3>Top selling products</h3>
            </div>
            <span className="card-icon"><FiPackage /></span>
          </div>
          <div className="product-ranking">
            {dashboard.topProducts.length ? dashboard.topProducts.map((product, index) => (
              <div className="ranking-item" key={product.id || product.name || index}>
                <span className="ranking-number">0{index + 1}</span>
                <div className="ranking-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : <FiPackage />}
                </div>
                <div className="ranking-info">
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                </div>
                <div className="ranking-sales">
                  <strong>{product.unitsSold}</strong>
                  <span>Sold</span>
                </div>
              </div>
            )) : <p className="empty-note">No product sales in this period yet.</p>}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">STOCK MONITOR</span>
              <h3>Inventory alerts</h3>
            </div>
            <span className="alert-count">{dashboard.lowStock.length} alerts</span>
          </div>
          <div className="inventory-alert-list">
            {dashboard.lowStock.length ? dashboard.lowStock.slice(0, 5).map((product, index) => {
              const stock = Number(product.stock ?? product.quantity ?? 0);
              return (
                <div className="inventory-alert" key={product.id || product.name || index}>
                  <div className="inventory-alert-icon"><FiAlertCircle /></div>
                  <div className="inventory-alert-info">
                    <strong>{product.name || "Unnamed product"}</strong>
                    <span>Low stock warning</span>
                  </div>
                  <strong className="stock-number">{stock} left</strong>
                </div>
              );
            }) : (
              <div className="inventory-clear">
                <span><FiPackage /></span>
                <strong>Inventory looks healthy</strong>
                <p>No products are currently below their stock thresholds.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-card recent-orders-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">LATEST ACTIVITY</span>
            <h3>Recent orders</h3>
          </div>
          <button className="text-action" onClick={() => window.location.assign("/admin/orders")}>
            View all <FiArrowRight />
          </button>
        </div>
        <div className="orders-table-wrap">
          <table className="aura-orders-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentOrders.map((order, index) => {
                const status = String(order.status || order.orderStatus || "Pending").toLowerCase();
                const customer = order.customerName ||
                  `${order.customerInfo?.firstName || ""} ${order.customerInfo?.lastName || ""}`.trim() ||
                  order.name ||
                  order.customer?.name ||
                  "Customer";
                return (
                  <tr key={order.id || index}>
                    <td className="order-id">#{(order.orderNumber || order.id || "—").toString().slice(-8).toUpperCase()}</td>
                    <td>
                      <div className="order-customer">
                        <span>{getInitials(customer)}</span>
                        {customer}
                      </div>
                    </td>
                    <td>{order._date?.toLocaleDateString("en-PK") || "—"}</td>
                    <td className="order-amount">{currency(order._total)}</td>
                    <td>
                      <span className={`order-status status-${status.replace(/\s+/g, "-")}`}>{status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        title="Delete order"
                        onClick={() => setDeleteTarget(order)}
                        style={{
                          border: "1px solid #f0d5d5",
                          background: "#fff0f0",
                          color: "#c03939",
                          borderRadius: "4px",
                          width: "28px",
                          height: "28px",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!dashboard.recentOrders.length && (
            <div className="empty-table">
              <FiShoppingBag />
              <strong>No orders to display</strong>
              <span>New orders will appear here when customers purchase from your store.</span>
            </div>
          )}
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>AURA · Luxury Commerce Intelligence</span>
        <span><FiRefreshCw /> Live database connection</span>
      </footer>

      {deleteTarget && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(20,19,18,.62)",
            backdropFilter: "blur(5px)", zIndex: 1100,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(460px, 100%)", background: "#fff", borderRadius: "8px", overflow: "hidden" }}
          >
            <div style={{ padding: "20px 22px", borderBottom: "1px solid #eae4dc", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: 1.6, color: "#873b4c", textTransform: "uppercase" }}>DELETE ORDER</span>
                <h2 style={{ margin: "4px 0 0", fontFamily: "Playfair Display, serif", fontSize: "22px" }}>Are you sure?</h2>
              </div>
              <button
                onClick={() => !deleting && setDeleteTarget(null)}
                style={{ border: "1px solid #eae4dc", background: "#fff", width: 32, height: 32, borderRadius: 4, cursor: "pointer", display: "grid", placeItems: "center" }}
              >
                <FiX />
              </button>
            </div>
            <div style={{ padding: "20px 22px" }}>
              <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#625d57", margin: 0 }}>
                This will permanently delete order <strong>#{deleteTarget.id}</strong> from the database.
                It will also be removed from customer history and revenue reports. This cannot be undone.
              </p>
            </div>
            <div style={{ padding: "14px 22px", background: "#fbf9f6", borderTop: "1px solid #eae4dc", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{ padding: "10px 16px", border: "1px solid #eae4dc", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={deleting}
                style={{ padding: "10px 16px", border: "1px solid #b55353", background: "#b55353", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <FiTrash2 /> {deleting ? "Deleting..." : "Delete Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;