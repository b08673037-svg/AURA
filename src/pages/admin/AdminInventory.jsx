
import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiPackage,
  FiLayers,
  FiAlertTriangle,
  FiXCircle,
  FiPlus,
  FiMinus,
  FiEdit3,
  FiX,
  FiActivity,
  FiArrowUpRight,
  FiArrowDownRight,
  FiFilter,
  FiChevronDown,
  FiBox,
} from "react-icons/fi";

import {
  onValue,
  ref,
  update,
  push,
  set,
} from "firebase/database";

import { db } from "../../services/firebase";
import "./AdminInventory.css";

const LOW_STOCK_LIMIT = 5;

const formatPKR = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

const getStock = (product) =>
  Math.max(0, Number(product.stock ?? 0));

const getPrice = (product) =>
  Number(product.price ?? product.salePrice ?? 0);

const getInventoryStatus = (product) => {
  const stock = getStock(product);

  if (stock === 0) return "Out of Stock";
  if (stock <= LOW_STOCK_LIMIT) return "Low Stock";
  return "In Stock";
};

const formatDate = (value) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function InventoryStatus({ status }) {
  const className = status.toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`inventory-status status-${className}`}>
      <span className="inventory-status-dot" />
      {status}
    </span>
  );
}

function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("New stock received");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const productsRef = ref(db, "products");
    const activityRef = ref(db, "inventoryActivity");

    const unsubscribeProducts = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val();

        const formatted = data
          ? Object.entries(data).map(([id, product]) => ({
              ...product,
              id,
            }))
          : [];

        setProducts(formatted);
        setLoading(false);
        setError("");
      },
      (firebaseError) => {
        console.error("Inventory loading error:", firebaseError);
        setError("Unable to load inventory. Check your Firebase permissions.");
        setLoading(false);
      }
    );

    const unsubscribeActivities = onValue(
      activityRef,
      (snapshot) => {
        const data = snapshot.val();

        const formatted = data
          ? Object.entries(data).map(([id, activity]) => ({
              ...activity,
              id,
            }))
          : [];

        formatted.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

        setActivities(formatted.slice(0, 8));
      },
      (firebaseError) => {
        console.error("Inventory activity error:", firebaseError);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeActivities();
    };
  }, []);

  const stats = useMemo(() => {
    const totalUnits = products.reduce(
      (sum, product) => sum + getStock(product),
      0
    );

    const lowStock = products.filter(
      (product) => {
        const stock = getStock(product);
        return stock > 0 && stock <= LOW_STOCK_LIMIT;
      }
    ).length;

    const outOfStock = products.filter(
      (product) => getStock(product) === 0
    ).length;

    const inventoryValue = products.reduce(
      (sum, product) =>
        sum + getStock(product) * getPrice(product),
      0
    );

    return {
      totalProducts: products.length,
      totalUnits,
      lowStock,
      outOfStock,
      inventoryValue,
    };
  }, [products]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        products.map((product) => product.category).filter(Boolean)
      ),
    ].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const sku = String(product.sku || "").toLowerCase();
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        name.includes(searchTerm) || sku.includes(searchTerm);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category === categoryFilter;

      const status = getInventoryStatus(product);

      const matchesStock =
        stockFilter === "All" ||
        status === stockFilter;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const openAdjustment = (product, type = "add") => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setQuantity("");
    setReason(
      type === "add"
        ? "New stock received"
        : "Stock correction"
    );
    setFormError("");
  };

  const handleAdjustment = async (event) => {
    event.preventDefault();

    if (!selectedProduct || saving) return;

    const adjustment = Number(quantity);

    if (!Number.isInteger(adjustment) || adjustment <= 0) {
      setFormError("Enter a valid whole number greater than zero.");
      return;
    }

    const currentStock = getStock(selectedProduct);

    const newStock =
      adjustmentType === "add"
        ? currentStock + adjustment
        : currentStock - adjustment;

    if (newStock < 0) {
      setFormError("You cannot remove more units than are currently in stock.");
      return;
    }

    if (!reason.trim()) {
      setFormError("Please provide a reason for this adjustment.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const now = new Date().toISOString();

      await update(ref(db, `products/${selectedProduct.id}`), {
        stock: newStock,
        updatedAt: now,
      });

      const activityRef = push(ref(db, "inventoryActivity"));

      await set(activityRef, {
        productId: selectedProduct.id,
        productName: selectedProduct.name || "Unnamed Product",
        sku: selectedProduct.sku || "",
        type: adjustmentType,
        quantity: adjustment,
        previousStock: currentStock,
        newStock,
        reason: reason.trim(),
        createdAt: now,
      });

      setSelectedProduct(null);
      setQuantity("");
    } catch (firebaseError) {
      console.error("Inventory adjustment error:", firebaseError);
      setFormError(
        "Unable to save the adjustment. Check your Firebase permissions and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // onValue keeps inventory synchronized automatically.
    window.setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="inventory-page">
      {/* Page heading */}
      <header className="inventory-heading">
        <div>
          <span className="inventory-eyebrow">AURA / OPERATIONS</span>
          <h1>Inventory Studio</h1>
          <p>
            Monitor stock levels, manage product quantities, and
            keep your collections ready for every customer.
          </p>
        </div>

        <button
          className="inventory-refresh-btn"
          onClick={handleRefresh}
          type="button"
        >
          <FiRefreshCw className={refreshing ? "inventory-spinning" : ""} />
          Refresh
        </button>
      </header>

      {/* Statistics */}
      <section className="inventory-stats">
        <article className="inventory-stat-card">
          <div className="inventory-stat-heading">
            <span>Total Products</span>
            <span className="inventory-stat-icon icon-charcoal">
              <FiPackage />
            </span>
          </div>
          <strong>{stats.totalProducts.toLocaleString()}</strong>
          <small>Products in your catalog</small>
        </article>

        <article className="inventory-stat-card">
          <div className="inventory-stat-heading">
            <span>Available Units</span>
            <span className="inventory-stat-icon icon-champagne">
              <FiLayers />
            </span>
          </div>
          <strong>{stats.totalUnits.toLocaleString()}</strong>
          <small>Total physical stock</small>
        </article>

        <article className="inventory-stat-card">
          <div className="inventory-stat-heading">
            <span>Low Stock</span>
            <span className="inventory-stat-icon icon-amber">
              <FiAlertTriangle />
            </span>
          </div>
          <strong>{stats.lowStock.toLocaleString()}</strong>
          <small>Products needing restock</small>
        </article>

        <article className="inventory-stat-card">
          <div className="inventory-stat-heading">
            <span>Out of Stock</span>
            <span className="inventory-stat-icon icon-red">
              <FiXCircle />
            </span>
          </div>
          <strong>{stats.outOfStock.toLocaleString()}</strong>
          <small>Products with zero units</small>
        </article>

        <article className="inventory-stat-card inventory-value-card">
          <div className="inventory-stat-heading">
            <span>Stock Value</span>
            <span className="inventory-stat-icon icon-burgundy">
              <FiActivity />
            </span>
          </div>
          <strong>{formatPKR(stats.inventoryValue)}</strong>
          <small>Based on current product prices</small>
        </article>
      </section>

      {/* Inventory health */}
      <section className="inventory-health">
        <div className="inventory-health-header">
          <div>
            <span className="inventory-eyebrow">STOCK OVERVIEW</span>
            <h2>Inventory Health</h2>
            <p>How your current product quantities are distributed.</p>
          </div>
          <span className="inventory-health-total">
            {stats.totalProducts} products
          </span>
        </div>

        {(() => {
          const inStock = products.filter(
            (product) => getStock(product) > LOW_STOCK_LIMIT
          ).length;

          const low = stats.lowStock;
          const out = stats.outOfStock;
          const total = stats.totalProducts || 1;

          const inWidth = (inStock / total) * 100;
          const lowWidth = (low / total) * 100;
          const outWidth = (out / total) * 100;

          return (
            <>
              <div className="inventory-health-bar">
                <span
                  className="health-in-stock"
                  style={{ width: `${inWidth}%` }}
                />
                <span
                  className="health-low-stock"
                  style={{ width: `${lowWidth}%` }}
                />
                <span
                  className="health-out-stock"
                  style={{ width: `${outWidth}%` }}
                />
              </div>

              <div className="inventory-health-legend">
                <span>
                  <i className="legend-green" />
                  In Stock <strong>{inStock}</strong>
                </span>
                <span>
                  <i className="legend-amber" />
                  Low Stock <strong>{low}</strong>
                </span>
                <span>
                  <i className="legend-red" />
                  Out of Stock <strong>{out}</strong>
                </span>
              </div>
            </>
          );
        })()}
      </section>

      {/* Product inventory */}
      <section className="inventory-directory">
        <div className="inventory-directory-header">
          <div>
            <span className="inventory-eyebrow">STOCK CONTROL</span>
            <h2>Product Inventory</h2>
          </div>

          <span className="inventory-results">
            {filteredProducts.length} results
          </span>
        </div>

        <div className="inventory-toolbar">
          <div className="inventory-search">
            <FiSearch />
            <input
              type="search"
              placeholder="Search product name or SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="inventory-filter">
            <FiFilter />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <FiChevronDown />
          </div>

          <div className="inventory-filter">
            <FiBox />
            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <FiChevronDown />
          </div>
        </div>

        <div className="inventory-table-card">
          {loading ? (
            <div className="inventory-state">
              <div className="inventory-loader" />
              <h3>Loading inventory</h3>
              <p>Connecting to your product database...</p>
            </div>
          ) : error ? (
            <div className="inventory-state">
              <FiAlertTriangle className="inventory-error-icon" />
              <h3>Unable to load inventory</h3>
              <p>{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="inventory-state">
              <div className="inventory-empty-icon">
                <FiPackage />
              </div>
              <h3>No products found</h3>
              <p>
                {products.length
                  ? "Try changing your search or filters."
                  : "Products added to your catalog will appear here."}
              </p>
              {(search ||
                categoryFilter !== "All" ||
                stockFilter !== "All") && (
                <button
                  className="inventory-clear-btn"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("All");
                    setStockFilter("All");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="inventory-table-scroll">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Level</th>
                    <th>Stock Status</th>
                    <th>Adjustment</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const stock = getStock(product);
                    const status = getInventoryStatus(product);
                    const stockWidth = Math.min(
                      (stock / 30) * 100,
                      100
                    );

                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="inventory-product">
                            <div className="inventory-product-image">
                              {product.image || product.imageUrl ? (
                                <img
                                  src={product.image || product.imageUrl}
                                  alt={product.name || "Product"}
                                />
                              ) : (
                                <FiPackage />
                              )}
                            </div>
                            <div>
                              <strong>
                                {product.name || "Unnamed Product"}
                              </strong>
                              <small>
                                {product.status === "draft"
                                  ? "Draft product"
                                  : "Catalog product"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="inventory-sku">
                            {product.sku || "—"}
                          </span>
                        </td>

                        <td>
                          <span className="inventory-category">
                            {product.category || "Uncategorized"}
                          </span>
                        </td>

                        <td>
                          <strong className="inventory-price">
                            {formatPKR(getPrice(product))}
                          </strong>
                        </td>

                        <td>
                          <div className="stock-level">
                            <div className="stock-level-top">
                              <strong>{stock} units</strong>
                            </div>
                            <div className="stock-progress">
                              <span
                                className={`stock-progress-fill ${
                                  status === "Out of Stock"
                                    ? "fill-red"
                                    : status === "Low Stock"
                                      ? "fill-amber"
                                      : "fill-green"
                                }`}
                                style={{ width: `${stockWidth}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          <InventoryStatus status={status} />
                        </td>

                        <td>
                          <div className="inventory-actions">
                            <button
                              className="stock-add-btn"
                              onClick={() =>
                                openAdjustment(product, "add")
                              }
                              title="Add stock"
                              type="button"
                            >
                              <FiPlus />
                            </button>

                            <button
                              className="stock-remove-btn"
                              onClick={() =>
                                openAdjustment(product, "remove")
                              }
                              title="Remove stock"
                              type="button"
                              disabled={stock === 0}
                            >
                              <FiMinus />
                            </button>

                            <button
                              className="stock-adjust-btn"
                              onClick={() =>
                                openAdjustment(product, "add")
                              }
                              title="Adjust stock"
                              type="button"
                            >
                              <FiEdit3 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="inventory-table-footer">
              <span>
                Showing <strong>{filteredProducts.length}</strong> of{" "}
                <strong>{products.length}</strong> products
              </span>
              <span className="inventory-live">
                <i />
                Live inventory sync
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Recent activity */}
      <section className="inventory-activity-section">
        <div className="inventory-activity-heading">
          <div>
            <span className="inventory-eyebrow">INVENTORY HISTORY</span>
            <h2>Recent Stock Activity</h2>
            <p>Latest stock adjustments recorded in your database.</p>
          </div>
          <FiActivity />
        </div>

        {activities.length === 0 ? (
          <div className="inventory-no-activity">
            <FiActivity />
            <p>No stock adjustments have been recorded yet.</p>
          </div>
        ) : (
          <div className="inventory-activity-list">
            {activities.map((activity) => {
              const isAddition = activity.type === "add";

              return (
                <div className="inventory-activity-item" key={activity.id}>
                  <div
                    className={`activity-icon ${
                      isAddition ? "activity-add" : "activity-remove"
                    }`}
                  >
                    {isAddition ? (
                      <FiArrowUpRight />
                    ) : (
                      <FiArrowDownRight />
                    )}
                  </div>

                  <div className="activity-description">
                    <strong>{activity.productName}</strong>
                    <span>
                      {isAddition ? "Stock added" : "Stock removed"} ·{" "}
                      {activity.reason}
                    </span>
                    <small>{formatDate(activity.createdAt)}</small>
                  </div>

                  <div className="activity-quantity">
                    <strong className={isAddition ? "quantity-added" : "quantity-removed"}>
                      {isAddition ? "+" : "-"}
                      {activity.quantity}
                    </strong>
                    <small>
                      {activity.previousStock} → {activity.newStock} units
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Stock adjustment modal */}
      {selectedProduct && (
        <div
          className="inventory-modal-overlay"
          onClick={() => !saving && setSelectedProduct(null)}
        >
          <div
            className="inventory-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="inventory-modal-header">
              <div>
                <span className="inventory-eyebrow">STOCK CONTROL</span>
                <h2>Adjust Inventory</h2>
                <p>
                  Update the quantity for this product.
                </p>
              </div>

              <button
                type="button"
                className="inventory-modal-close"
                onClick={() => setSelectedProduct(null)}
                disabled={saving}
                aria-label="Close adjustment modal"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAdjustment}>
              <div className="adjustment-product">
                <div className="adjustment-product-image">
                  {selectedProduct.image || selectedProduct.imageUrl ? (
                    <img
                      src={selectedProduct.image || selectedProduct.imageUrl}
                      alt={selectedProduct.name || "Product"}
                    />
                  ) : (
                    <FiPackage />
                  )}
                </div>

                <div>
                  <strong>
                    {selectedProduct.name || "Unnamed Product"}
                  </strong>
                  <span>SKU: {selectedProduct.sku || "Not assigned"}</span>
                  <small>
                    Current stock:{" "}
                    <b>{getStock(selectedProduct)} units</b>
                  </small>
                </div>
              </div>

              <div className="adjustment-type-selector">
                <button
                  type="button"
                  className={
                    adjustmentType === "add" ? "selected-add" : ""
                  }
                  onClick={() => {
                    setAdjustmentType("add");
                    setFormError("");
                  }}
                >
                  <FiPlus /> Add Stock
                </button>

                <button
                  type="button"
                  className={
                    adjustmentType === "remove" ? "selected-remove" : ""
                  }
                  onClick={() => {
                    setAdjustmentType("remove");
                    setFormError("");
                  }}
                >
                  <FiMinus /> Remove Stock
                </button>
              </div>

              <label className="adjustment-label" htmlFor="stock-quantity">
                Quantity
              </label>
              <input
                id="stock-quantity"
                className="adjustment-input"
                type="number"
                min="1"
                step="1"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setFormError("");
                }}
                required
              />

              <label className="adjustment-label" htmlFor="stock-reason">
                Reason for adjustment
              </label>
              <select
                id="stock-reason"
                className="adjustment-input"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              >
                <option>New stock received</option>
                <option>Stock correction</option>
                <option>Damaged products</option>
                <option>Returned products</option>
                <option>Manual inventory update</option>
                <option>Other</option>
              </select>

              {formError && (
                <p className="adjustment-error">{formError}</p>
              )}

              <div className="adjustment-preview">
                <span>New stock quantity</span>
                <strong>
                  {(() => {
                    const amount = Number(quantity) || 0;
                    const current = getStock(selectedProduct);
                    const next =
                      adjustmentType === "add"
                        ? current + amount
                        : current - amount;

                    return `${Math.max(0, next)} units`;
                  })()}
                </strong>
              </div>

              <div className="inventory-modal-actions">
                <button
                  type="button"
                  className="adjustment-cancel-btn"
                  onClick={() => setSelectedProduct(null)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`adjustment-save-btn ${
                    adjustmentType === "remove" ? "save-remove" : ""
                  }`}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : adjustmentType === "add"
                      ? "Confirm Stock Addition"
                      : "Confirm Stock Removal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInventory;
