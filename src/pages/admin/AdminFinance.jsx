import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiArrowDownRight,
  FiArrowUpRight,
  FiCalendar,
  FiCreditCard,
  FiDownload,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
  FiBriefcase, // <-- Replaced FiWallet with FiBriefcase
  FiX,
} from "react-icons/fi";
import { onValue, ref, push, set, update, remove } from "firebase/database";
import { db } from "../../services/firebase";
import "./AdminFinance.css";

const CATEGORIES = [
  "Marketing",
  "Shipping",
  "Packaging",
  "Salaries",
  "Operations",
  "Rent",
  "Other",
];

const EMPTY_FORM = {
  title: "",
  category: "Operations",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "Bank Transfer",
  notes: "",
};

const money = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const dateOf = (value) => {
  if (!value) return null;
  if (typeof value === "object" && value.seconds) {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === "number") {
    return new Date(value < 1e12 ? value * 1000 : value);
  }
  const result = new Date(value);
  return Number.isNaN(result.getTime()) ? null : result;
};

const orderDate = (order) =>
  dateOf(order.createdAt || order.orderDate || order.date || order.timestamp);

const orderAmount = (order) =>
  Number(
    order.totalAmount ?? order.grandTotal ?? order.total ?? order.amount ?? 0
  ) || 0;

const expenseDate = (expense) => dateOf(expense.date || expense.createdAt);

const paidOrder = (order) => {
  const status = String(order.status || "").toLowerCase();
  const payment = String(order.paymentStatus || "").toLowerCase();
  const excluded = ["cancelled", "canceled", "refunded", "failed"];

  if (excluded.includes(status) || excluded.includes(payment)) return false;
  if (payment) return ["paid", "completed", "success", "successful"].includes(payment);
  return ["paid", "completed", "delivered"].includes(status);
};

function rangeStart(range) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - Number(range) + 1);
  return date;
}

function previousRangeStart(range) {
  const date = rangeStart(range);
  date.setDate(date.getDate() - Number(range));
  return date;
}

function getMonthlyData(orders, expenses, range) {
  const count = range === "365" ? 12 : 6;
  const data = [];

  for (let i = count - 1; i >= 0; i--) {
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setMonth(monthDate.getMonth() - i);

    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();

    const revenue = orders
      .filter((order) => {
        const date = orderDate(order);
        return date && date.getMonth() === month &&
          date.getFullYear() === year && paidOrder(order);
      })
      .reduce((sum, order) => sum + orderAmount(order), 0);

    const expense = expenses
      .filter((item) => {
        const date = expenseDate(item);
        return date && date.getMonth() === month &&
          date.getFullYear() === year;
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    data.push({
      label: monthDate.toLocaleDateString("en", { month: "short" }),
      revenue,
      expenses: expense,
      profit: revenue - expense,
    });
  }

  return data;
}

function MetricCard({ title, value, note, icon, type, change }) {
  return (
    <article className="finance-metric">
      <div className="finance-metric-top">
        <span>{title}</span>
        <i className={`finance-metric-icon ${type}`}>{icon}</i>
      </div>
      <h3>{value}</h3>
      <div className="finance-metric-bottom">
        <span className={change > 0 ? "positive" : change < 0 ? "negative" : ""}>
          {change === null
            ? "No previous baseline"
            : `${change > 0 ? "+" : ""}${change.toFixed(1)}%`}
        </span>
        <small>{note}</small>
      </div>
    </article>
  );
}

function RevenueChart({ data }) {
  const max = Math.max(
    1,
    ...data.flatMap((item) => [item.revenue, item.expenses])
  );

  return (
    <div className="finance-chart">
      <div className="finance-chart-legend">
        <span><i className="legend-revenue" /> Revenue</span>
        <span><i className="legend-expense" /> Expenses</span>
      </div>

      <div className="finance-chart-body">
        <div className="finance-y-labels">
          <span>{money(max)}</span>
          <span>{money(max * 0.75)}</span>
          <span>{money(max * 0.5)}</span>
          <span>{money(max * 0.25)}</span>
          <span>Rs. 0</span>
        </div>

        <div className="finance-bars-area">
          {[0, 1, 2, 3, 4].map((item) => (
            <div className="finance-chart-gridline" key={item} style={{ top: `${item * 25}%` }} />
          ))}

          <div className="finance-bars">
            {data.map((item, index) => (
              <div className="finance-bar-group" key={`${item.label}-${index}`}>
                <div className="finance-bar-pair">
                  <div
                    className="finance-bar revenue-bar"
                    style={{ height: `${(item.revenue / max) * 100}%` }}
                    title={`Revenue: ${money(item.revenue)}`}
                  />
                  <div
                    className="finance-bar expense-bar"
                    style={{ height: `${(item.expenses / max) * 100}%` }}
                    title={`Expenses: ${money(item.expenses)}`}
                  />
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpenseBreakdown({ expenses }) {
  const grouped = useMemo(() => {
    const result = {};
    expenses.forEach((item) => {
      const category = item.category || "Other";
      result[category] = (result[category] || 0) + Number(item.amount || 0);
    });
    return Object.entries(result)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const total = grouped.reduce((sum, item) => sum + item.amount, 0);
  const colors = ["#873b4c", "#b99a65", "#33302e", "#9b8178", "#d9cfc3", "#74645e", "#bd9292"];

  return (
    <div className="finance-breakdown">
      {grouped.length === 0 ? (
        <div className="finance-empty">No expenses recorded in this period.</div>
      ) : (
        <>
          <div className="finance-category-list">
            {grouped.map((item, index) => {
              const percent = total ? (item.amount / total) * 100 : 0;
              return (
                <div className="finance-category-item" key={item.category}>
                  <div className="finance-category-heading">
                    <span>
                      <i style={{ background: colors[index % colors.length] }} />
                      {item.category}
                    </span>
                    <strong>{money(item.amount)}</strong>
                  </div>
                  <div className="finance-progress">
                    <span
                      style={{
                        width: `${percent}%`,
                        background: colors[index % colors.length],
                      }}
                    />
                  </div>
                  <small>{percent.toFixed(1)}% of recorded expenses</small>
                </div>
              );
            })}
          </div>
          <div className="finance-category-total">
            <span>Total recorded expenses</span>
            <strong>{money(total)}</strong>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminFinance() {
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [range, setRange] = useState("30");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stopOrders = onValue(
      ref(db, "orders"),
      (snapshot) => {
        const value = snapshot.val() || {};
        setOrders(Object.entries(value).map(([id, item]) => ({ id, ...item })));
        setLoading(false);
        setLoadError("");
      },
      (error) => {
        console.error(error);
        setLoadError("Could not load orders. Check your Firebase database rules.");
        setLoading(false);
      }
    );

    const stopExpenses = onValue(
      ref(db, "expenses"),
      (snapshot) => {
        const value = snapshot.val() || {};
        setExpenses(Object.entries(value).map(([id, item]) => ({ id, ...item })));
      },
      (error) => console.error("Expense listener:", error)
    );

    return () => {
      stopOrders();
      stopExpenses();
    };
  }, []);

  const start = useMemo(() => rangeStart(range), [range]);
  const previousStart = useMemo(() => previousRangeStart(range), [range]);

  const currentOrders = useMemo(
    () => orders.filter((item) => {
      const date = orderDate(item);
      return date && date >= start && paidOrder(item);
    }),
    [orders, start]
  );

  const currentExpenses = useMemo(
    () => expenses.filter((item) => {
      const date = expenseDate(item);
      return date && date >= start;
    }),
    [expenses, start]
  );

  const previousOrders = useMemo(
    () => orders.filter((item) => {
      const date = orderDate(item);
      return date && date >= previousStart && date < start && paidOrder(item);
    }),
    [orders, previousStart, start]
  );

  const previousExpenses = useMemo(
    () => expenses.filter((item) => {
      const date = expenseDate(item);
      return date && date >= previousStart && date < start;
    }),
    [expenses, previousStart, start]
  );

  const stats = useMemo(() => {
    const sumOrders = (list) =>
      list.reduce((sum, item) => sum + orderAmount(item), 0);
    const sumExpenses = (list) =>
      list.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const revenue = sumOrders(currentOrders);
    const expense = sumExpenses(currentExpenses);
    const oldRevenue = sumOrders(previousOrders);
    const oldExpense = sumExpenses(previousExpenses);
    const profit = revenue - expense;
    const oldProfit = oldRevenue - oldExpense;

    const change = (now, before) =>
      before === 0 ? (now > 0 ? null : 0) : ((now - before) / Math.abs(before)) * 100;

    return {
      revenue,
      expense,
      profit,
      margin: revenue ? (profit / revenue) * 100 : 0,
      average: currentOrders.length ? revenue / currentOrders.length : 0,
      count: currentOrders.length,
      revenueChange: change(revenue, oldRevenue),
      expenseChange: change(expense, oldExpense),
      profitChange: change(profit, oldProfit),
    };
  }, [currentOrders, currentExpenses, previousOrders, previousExpenses]);

  const chartData = useMemo(
    () => getMonthlyData(orders, expenses, range),
    [orders, expenses, range]
  );

  const transactions = useMemo(() => {
    const income = currentOrders.map((item) => ({
      id: item.id,
      type: "income",
      title: item.orderNumber || item.invoiceNumber || `Order #${item.id.slice(-6)}`,
      category: "Customer order",
      date: orderDate(item),
      amount: orderAmount(item),
      method: item.paymentMethod || "Not specified",
      status: item.paymentStatus || item.status || "Paid",
    }));

    const outgoing = currentExpenses.map((item) => ({
      id: item.id,
      type: "expense",
      title: item.title || "Business expense",
      category: item.category || "Other",
      date: expenseDate(item),
      amount: Number(item.amount || 0),
      method: item.paymentMethod || "Not specified",
      status: "Recorded",
    }));

    return [...income, ...outgoing]
      .filter((item) => {
        const query = search.toLowerCase();
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query);
        return matchesSearch && (filter === "all" || item.type === filter);
      })
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  }, [currentOrders, currentExpenses, search, filter]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      category: item.category || "Operations",
      amount: item.amount ?? "",
      date: item.date || "",
      paymentMethod: item.paymentMethod || "Bank Transfer",
      notes: item.notes || "",
    });
    setModalOpen(true);
  };

  const handleFormChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const saveExpense = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);

    if (!form.title.trim() || !form.date || !Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a title, valid date and amount greater than zero.");
      return;
    }

    setSaving(true);
    const data = {
      title: form.title.trim(),
      category: form.category,
      amount,
      date: form.date,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
      updatedAt: Date.now(),
    };

    try {
      if (editingId) {
        await update(ref(db, `expenses/${editingId}`), data);
      } else {
        const newRef = push(ref(db, "expenses"));
        await set(newRef, { ...data, createdAt: Date.now() });
      }
      setModalOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert("Could not save the expense. Check Firebase permissions.");
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await remove(ref(db, `expenses/${item.id}`));
    } catch (error) {
      console.error(error);
      alert("Could not delete this expense.");
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Date", "Description", "Type", "Category", "Amount PKR", "Payment Method", "Status"],
      ...transactions.map((item) => [
        item.date?.toISOString().slice(0, 10) || "",
        item.title,
        item.type,
        item.category,
        item.amount,
        item.method,
        item.status,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`
      ).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aura-financial-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="finance-page">
        <div className="finance-loading"><span /> Loading financial reports...</div>
      </div>
    );
  }

  return (
    <main className="finance-page">
      <header className="finance-header">
        <div>
          <span className="finance-eyebrow"><FiActivity /> AURA BUSINESS INTELLIGENCE</span>
          <h1>Financial Reports</h1>
          <p>Track revenue, monitor expenses and understand your business performance.</p>
        </div>
        <div className="finance-header-actions">
          <label className="finance-select-wrap">
            <FiCalendar />
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last 12 months</option>
            </select>
          </label>
          <button className="finance-primary-btn" onClick={openAddModal}>
            <FiPlus /> Add Expense
          </button>
        </div>
      </header>

      {loadError && <div className="finance-error">{loadError}</div>}

      <section className="finance-hero">
        <div className="finance-hero-copy">
          <span>FINANCIAL PERFORMANCE</span>
          <h2>Every number tells a story.</h2>
          <p>One clear view of your sales, spending and operating performance.</p>
        </div>
        <div className="finance-hero-art"><FiTrendingUp /></div>
        <div className="finance-hero-result">
          <small>Net operating result</small>
          <strong>{money(stats.profit)}</strong>
          <span>{stats.profit >= 0 ? "Positive result" : "Negative result"}</span>
        </div>
      </section>

      <section className="finance-metrics-grid">
        <MetricCard
          title="Total Revenue"
          value={money(stats.revenue)}
          note="Paid orders in selected period"
          icon={<FiTrendingUp />}
          type="revenue"
          change={stats.revenueChange}
        />
        <MetricCard
          title="Total Expenses"
          value={money(stats.expense)}
          note="Recorded business expenses"
          icon={<FiArrowDownRight />}
          type="expense"
          change={stats.expenseChange}
        />
        <MetricCard
          title="Net Result"
          value={money(stats.profit)}
          note="Revenue minus expenses"
          icon={<FiBriefcase />} // <-- Fixed
          type="profit"
          change={stats.profitChange}
        />
        <MetricCard
          title="Profit Margin"
          value={`${stats.margin.toFixed(1)}%`}
          note="Net result divided by revenue"
          icon={<FiActivity />}
          type="margin"
          change={null}
        />
        <MetricCard
          title="Average Order Value"
          value={money(stats.average)}
          note={`${stats.count} paid orders`}
          icon={<FiCreditCard />}
          type="orders"
          change={null}
        />
      </section>

      <section className="finance-main-grid">
        <article className="finance-panel finance-revenue-panel">
          <div className="finance-panel-heading">
            <div>
              <span className="finance-panel-kicker">PERFORMANCE OVERVIEW</span>
              <h3>Revenue vs. Expenses</h3>
              <p>Monthly comparison of paid sales and recorded expenses.</p>
            </div>
            <span className="finance-panel-icon"><FiTrendingUp /></span>
          </div>
          <RevenueChart data={chartData} />
        </article>

        <article className="finance-panel finance-expense-panel">
          <div className="finance-panel-heading">
            <div>
              <span className="finance-panel-kicker">SPENDING ANALYSIS</span>
              <h3>Expense Breakdown</h3>
              <p>Where your recorded expenses are going.</p>
            </div>
            <span className="finance-panel-icon"><FiBriefcase /></span> {/* <-- Fixed */}
          </div>
          <ExpenseBreakdown expenses={currentExpenses} />
        </article>
      </section>

      <section className="finance-panel finance-transactions-panel">
        <div className="finance-transactions-heading">
          <div>
            <span className="finance-panel-kicker">FINANCIAL ACTIVITY</span>
            <h3>Recent Transactions</h3>
            <p>Review income and expenses for the selected period.</p>
          </div>
          <button className="finance-export-btn" onClick={exportCSV}>
            <FiDownload /> Export CSV
          </button>
        </div>

        <div className="finance-table-tools">
          <div className="finance-search">
            <FiSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
            />
          </div>
          <div className="finance-filter-tabs">
            {["all", "income", "expense"].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item === "all" ? "All" : item === "income" ? "Income" : "Expenses"}
              </button>
            ))}
          </div>
        </div>

        <div className="finance-table-scroll">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Category</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th className="amount-cell">Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="finance-no-results">
                    No transactions found for this period.
                  </td>
                </tr>
              ) : transactions.map((item) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td>
                    <div className="finance-transaction-name">
                      <span className={item.type === "income" ? "income-symbol" : "expense-symbol"}>
                        {item.type === "income" ? <FiArrowDownRight /> : <FiArrowUpRight />}
                      </span>
                      <strong>{item.title}</strong>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.date?.toLocaleDateString("en-PK") || "—"}</td>
                  <td>{item.method}</td>
                  <td><span className="finance-status">{item.status}</span></td>
                  <td className={`amount-cell ${item.type === "income" ? "income-amount" : "expense-amount"}`}>
                    {item.type === "income" ? "+" : "−"}{money(item.amount)}
                  </td>
                  <td>
                    {item.type === "expense" ? (
                      <div className="finance-row-actions">
                        <button title="Edit expense" onClick={() => openEditModal(
                          expenses.find((expense) => expense.id === item.id)
                        )}>
                          <FiEdit2 />
                        </button>
                        <button title="Delete expense" onClick={() => deleteExpense(item)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    ) : <span className="finance-readonly">Order</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="finance-table-footer">
          Showing {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
        </div>
      </section>

      {modalOpen && (
        <div className="finance-modal-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}>
          <form className="finance-modal" onSubmit={saveExpense}>
            <div className="finance-modal-heading">
              <div>
                <span className="finance-panel-kicker">EXPENSE MANAGEMENT</span>
                <h3>{editingId ? "Edit Expense" : "Add New Expense"}</h3>
                <p>Record a business expense in your financial reports.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)}><FiX /></button>
            </div>

            <label>
              Expense title
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. Instagram campaign"
                required
              />
            </label>

            <div className="finance-form-row">
              <label>
                Category
                <select name="category" value={form.category} onChange={handleFormChange}>
                  {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label>
                Amount (PKR)
                <input
                  name="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={handleFormChange}
                  placeholder="5000"
                  required
                />
              </label>
            </div>

            <div className="finance-form-row">
              <label>
                Expense date
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>
                Payment method
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleFormChange}>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>JazzCash</option>
                  <option>EasyPaisa</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <label>
              Notes <span className="finance-optional">(optional)</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                placeholder="Add any additional details..."
                rows="3"
              />
            </label>

            <div className="finance-modal-actions">
              <button type="button" className="finance-cancel-btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="finance-primary-btn" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save Changes" : "Save Expense"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}