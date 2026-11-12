
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiDownload,
  FiActivity,
  FiRefreshCw,
  FiCalendar,
  FiArrowUpRight,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { db } from "../../services/firebase";
import { ref, onValue, get } from "firebase/database";

import {
  formatPKR,
  getOrderAmount,
  isRevenueOrder,
  getDateRange,
  filterOrdersByDate,
  generateRevenueChartData,
  generateCategoryData,
  generateTopProducts,
  getOrderCounts,
} from "../../utils/analyticsHelpers";

import "./AdminAnalytics.css";

const COLORS = [
  "#873B4C",
  "#B99A65",
  "#252525",
  "#A68C7B",
  "#D9CFC3",
  "#619E90",
  "#8C7B70",
];

const DATE_FILTERS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
];

const STATUS_CONFIG = [
  { key: "pending", label: "Pending", color: "#D9A441" },
  { key: "processing", label: "Processing", color: "#6487B8" },
  { key: "shipped", label: "Shipped", color: "#9B83C7" },
  { key: "delivered", label: "Delivered", color: "#619E90" },
  { key: "cancelled", label: "Cancelled", color: "#C56C6C" },
  { key: "refunded", label: "Refunded", color: "#8C7B70" },
];

const getCustomerName = (order) =>
  order?.customerName ||
  order?.customer?.name ||
  order?.shippingAddress?.fullName ||
  order?.userName ||
  order?.name ||
  "Guest Customer";

const getPaymentMethod = (order) =>
  order?.paymentMethod ||
  order?.payment?.method ||
  "Not specified";

const getDisplayDate = (order) => {
  const rawDate =
    order?.createdAt ||
    order?.date ||
    order?.timestamp ||
    order?.orderDate;

  if (!rawDate) return "Date unavailable";

  let date;

  if (typeof rawDate === "number") {
    date = new Date(
      rawDate < 1000000000000 ? rawDate * 1000 : rawDate
    );
  } else if (typeof rawDate === "object" && rawDate.seconds) {
    date = new Date(rawDate.seconds * 1000);
  } else {
    date = new Date(rawDate);
  }

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOrderStatus = (order) =>
  String(order?.status || "pending")
    .toLowerCase()
    .replace(/\s+/g, "-");

const getInitials = (name) =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "G";

const formatCompactPKR = (value) => {
  const amount = Number(value) || 0;

  if (amount >= 10000000) {
    return `Rs. ${(amount / 10000000).toFixed(1)}Cr`;
  }

  if (amount >= 100000) {
    return `Rs. ${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(1)}K`;
  }

  return `Rs. ${amount.toFixed(0)}`;
};

const AdminAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("last30");

  // Firebase real-time orders listener
  useEffect(() => {
    const ordersRef = ref(db, "orders");

    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        const data = snapshot.val() || {};

        const ordersList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        setOrders(ordersList);
        setError("");
        setLoading(false);
      },
      (firebaseError) => {
        console.error("Analytics Firebase error:", firebaseError);
        setError("Unable to load analytics data. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");

      const snapshot = await get(ref(db, "orders"));
      const data = snapshot.val() || {};

      const ordersList = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      setOrders(ordersList);
    } catch (refreshError) {
      console.error("Analytics refresh error:", refreshError);
      setError("Unable to refresh analytics. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter orders according to selected date
  const filteredOrders = useMemo(() => {
    const { start, end } = getDateRange(dateFilter);

    return filterOrdersByDate(orders, start, end);
  }, [orders, dateFilter]);

  // Revenue eligible orders
  const revenueOrders = useMemo(
    () => filteredOrders.filter(isRevenueOrder),
    [filteredOrders]
  );

  // KPI calculations
  const totalRevenue = useMemo(
    () =>
      revenueOrders.reduce(
        (sum, order) => sum + getOrderAmount(order),
        0
      ),
    [revenueOrders]
  );

  const totalOrders = filteredOrders.length;

  const averageOrderValue =
    revenueOrders.length > 0
      ? totalRevenue / revenueOrders.length
      : 0;

  const revenueOrderCount = revenueOrders.length;

  // Chart data
  const revenueChartData = useMemo(
    () => generateRevenueChartData(revenueOrders, dateFilter),
    [revenueOrders, dateFilter]
  );

  const categoryData = useMemo(
    () => generateCategoryData(revenueOrders),
    [revenueOrders]
  );

  const topProducts = useMemo(
    () => generateTopProducts(revenueOrders),
    [revenueOrders]
  );

  const orderCounts = useMemo(
    () => getOrderCounts(filteredOrders),
    [filteredOrders]
  );

  const totalStatusOrders = STATUS_CONFIG.reduce(
    (sum, status) => sum + (orderCounts[status.key] || 0),
    0
  );

  // Export filtered orders as CSV
  const handleExport = () => {
    if (!filteredOrders.length) {
      alert("There are no orders to export for this period.");
      return;
    }

    const headers = [
      "Order ID",
      "Customer",
      "Date",
      "Amount",
      "Status",
      "Payment Method",
    ];

    const rows = filteredOrders.map((order) => [
      order.id,
      getCustomerName(order),
      getDisplayDate(order),
      getOrderAmount(order),
      getOrderStatus(order),
      getPaymentMethod(order),
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `aura-sales-analytics-${dateFilter}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <FiRefreshCw className="spinner" />
        <p>Preparing your sales analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      {/* PAGE HEADER */}
      <div className="analytics-header">
        <div className="analytics-heading">
          <span className="eyebrow">AURA / BUSINESS INTELLIGENCE</span>

          <h1>Sales Analytics</h1>

          <p>
            Understand your business performance, monitor sales,
            and discover what drives your revenue.
          </p>
        </div>

        <div className="header-actions">
          <div className="date-filter">
            <FiCalendar />

            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              aria-label="Select analytics date range"
            >
              {DATE_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="export-btn"
            onClick={handleExport}
            type="button"
          >
            <FiDownload />
            <span>Export Report</span>
          </button>

          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            type="button"
            aria-label="Refresh analytics"
          >
            <FiRefreshCw className={refreshing ? "spinner" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="analytics-error">
          <FiAlertCircle />
          <span>{error}</span>
          <button type="button" onClick={handleRefresh}>
            Try again
          </button>
        </div>
      )}

      {/* KPI CARDS */}
      <section className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-top">
            <span>Total Revenue</span>
            <div className="kpi-icon revenue-icon">
              <FiDollarSign />
            </div>
          </div>

          <h2>{formatPKR(totalRevenue)}</h2>

          <span className="kpi-description">
            <FiActivity />
            Revenue from eligible orders
          </span>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span>Total Orders</span>
            <div className="kpi-icon orders-icon">
              <FiShoppingBag />
            </div>
          </div>

          <h2>{totalOrders.toLocaleString("en-PK")}</h2>

          <span className="kpi-description">
            <FiPackage />
            Orders in selected period
          </span>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span>Average Order Value</span>
            <div className="kpi-icon average-icon">
              <FiTrendingUp />
            </div>
          </div>

          <h2>{formatPKR(averageOrderValue)}</h2>

          <span className="kpi-description">
            <FiActivity />
            Average per revenue order
          </span>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span>Revenue Orders</span>
            <div className="kpi-icon customers-icon">
              <FiUsers />
            </div>
          </div>

          <h2>{revenueOrderCount.toLocaleString("en-PK")}</h2>

          <span className="kpi-description">
            <FiCheckCircle />
            Orders counted toward revenue
          </span>
        </article>
      </section>

      {/* REVENUE + CATEGORY CHARTS */}
      <section className="main-chart-grid">
        {/* REVENUE PERFORMANCE */}
        <article className="analytics-panel revenue-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">REVENUE OVER TIME</span>
              <h3>
                <FiTrendingUp />
                Revenue Performance
              </h3>
              <p>Sales revenue across your selected date range.</p>
            </div>
          </div>

          <div className="chart-wrapper">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={revenueChartData}
                  margin={{ top: 12, right: 12, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="auraRevenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#873B4C"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor="#873B4C"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 5"
                    vertical={false}
                    stroke="#EAE4DC"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#85817C", fontSize: 11 }}
                    minTickGap={20}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#85817C", fontSize: 11 }}
                    tickFormatter={formatCompactPKR}
                    width={75}
                  />

                  <Tooltip
                    formatter={(value) => [formatPKR(value), "Revenue"]}
                    contentStyle={{
                      border: "1px solid #EAE4DC",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#873B4C"
                    strokeWidth={2.5}
                    fill="url(#auraRevenueGradient)"
                    activeDot={{
                      r: 5,
                      stroke: "#873B4C",
                      strokeWidth: 2,
                      fill: "#FFFFFF",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-empty">
                <FiActivity />
                <p>No revenue data available for this period.</p>
              </div>
            )}
          </div>
        </article>

        {/* SALES BY CATEGORY */}
        <article className="analytics-panel category-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">PRODUCT BREAKDOWN</span>
              <h3>Sales by Category</h3>
              <p>Revenue distribution across categories.</p>
            </div>
          </div>

          {categoryData.length > 0 ? (
            <>
              <div className="category-chart">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => formatPKR(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="category-legend">
                {categoryData.map((category, index) => (
                  <div
                    className="legend-item"
                    key={`${category.name}-${index}`}
                  >
                    <span
                      className="dot"
                      style={{
                        backgroundColor:
                          COLORS[index % COLORS.length],
                      }}
                    />

                    <span className="legend-name">
                      {category.name}
                    </span>

                    <strong>{formatPKR(category.value)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="analytics-empty">
              <FiPackage />
              <p>No category data available.</p>
            </div>
          )}
        </article>
      </section>

      {/* ORDER STATUS OVERVIEW */}
      <section className="analytics-panel status-panel">
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">ORDER MANAGEMENT</span>
            <h3>Order Status Overview</h3>
            <p>Monitor the current status of orders in this period.</p>
          </div>

          <span className="status-total">
            {totalStatusOrders} Orders
          </span>
        </div>

        <div className="status-overview">
          {STATUS_CONFIG.map((status) => {
            const count = orderCounts[status.key] || 0;

            const percentage =
              totalStatusOrders > 0
                ? (count / totalStatusOrders) * 100
                : 0;

            return (
              <div className="status-item" key={status.key}>
                <div className="status-item-top">
                  <span>
                    <i style={{ backgroundColor: status.color }} />
                    {status.label}
                  </span>

                  <strong>{count}</strong>
                </div>

                <div className="status-progress">
                  <span
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: status.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM GRID */}
      <section className="bottom-grid">
        {/* TOP PRODUCTS */}
        <article className="analytics-panel top-products-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">PRODUCT PERFORMANCE</span>
              <h3>Top Selling Products</h3>
              <p>Your best-performing products by units sold.</p>
            </div>
          </div>

          <div className="top-products-list">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 6).map((product, index) => (
                <div
                  className="top-product-row"
                  key={product.id || `${product.name}-${index}`}
                >
                  <span className="product-rank">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="product-image">
                    <img
                      src={
                        product.image ||
                        "https://placehold.co/64x64/F8F5F0/873B4C?text=AURA"
                      }
                      alt={product.name || "Product"}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://placehold.co/64x64/F8F5F0/873B4C?text=AURA";
                      }}
                    />
                  </div>

                  <div className="prod-info">
                    <strong>{product.name}</strong>
                    <span>{product.sales} units sold</span>
                  </div>

                  <span className="prod-revenue">
                    {formatPKR(product.revenue)}
                  </span>
                </div>
              ))
            ) : (
              <div className="analytics-empty">
                <FiPackage />
                <p>No product sales available.</p>
              </div>
            )}
          </div>
        </article>

        {/* RECENT TRANSACTIONS */}
        <article className="analytics-panel transactions-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">LATEST ACTIVITY</span>
              <h3>Recent Transactions</h3>
              <p>Latest orders from your store.</p>
            </div>
          </div>

          <div className="transactions-table">
            {filteredOrders.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {[...filteredOrders]
                    .sort((a, b) => {
                      const dateA = new Date(
                        a.createdAt || a.date || a.timestamp || 0
                      ).getTime();

                      const dateB = new Date(
                        b.createdAt || b.date || b.timestamp || 0
                      ).getTime();

                      return dateB - dateA;
                    })
                    .slice(0, 6)
                    .map((order) => {
                      const customerName = getCustomerName(order);
                      const status = getOrderStatus(order);

                      return (
                        <tr key={order.id}>
                          <td className="order-id">
                            #{String(order.id).slice(-6)}
                          </td>

                          <td>
                            <div className="transaction-customer">
                              <span className="customer-avatar">
                                {getInitials(customerName)}
                              </span>
                              <span>{customerName}</span>
                            </div>
                          </td>

                          <td>{getDisplayDate(order)}</td>

                          <td className="transaction-amount">
                            {formatPKR(getOrderAmount(order))}
                          </td>

                          <td>
                            <span className={`status-badge ${status}`}>
                              {status.replace(/-/g, " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              <div className="analytics-empty">
                <FiShoppingBag />
                <p>No transactions found for this period.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* FOOTER */}
      <div className="analytics-footer">
        <span>
          AURA Business Intelligence
        </span>

        <span>
          Showing {filteredOrders.length} orders ·{" "}
          {DATE_FILTERS.find((item) => item.value === dateFilter)?.label}
        </span>
      </div>
    </div>
  );
};

export default AdminAnalytics;
