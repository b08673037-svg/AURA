import { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiRefreshCw,
  FiX,
  FiImage,
  FiFilter,
  FiBox,
  FiLayers,
} from "react-icons/fi";

import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
} from "firebase/database";

import { db } from "../../services/firebase";
import "./AdminProducts.css";

const INITIAL_FORM = {
  name: "",
  sku: "",
  category: "",
  price: "",
  stock: "",
  image: "",
  description: "",
  status: "active",
};

const formatPKR = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  // Listen to Firebase products in real time
  useEffect(() => {
    const productsRef = ref(db, "products");

    const unsubscribe = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val() || {};

        const productsList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        setProducts(productsList);
        setLoading(false);
        setError("");
      },
      (firebaseError) => {
        console.error("Products Firebase error:", firebaseError);
        setError("Unable to load products. Check your Firebase connection.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Product categories
  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.category?.trim())
          .filter(Boolean)
      ),
    ].sort();
  }, [products]);

  // Product statistics
  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "active"
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.stock || 0) > 0 &&
      Number(product.stock || 0) <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock || 0) <= 0
  ).length;

  // Search and filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        product.name?.toLowerCase().includes(searchValue) ||
        product.sku?.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category === categoryFilter;

      const stock = Number(product.stock || 0);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.status === "active") ||
        (statusFilter === "draft" && product.status === "draft") ||
        (statusFilter === "low-stock" && stock > 0 && stock <= 5) ||
        (statusFilter === "out-of-stock" && stock <= 0);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // Open add product modal
  const openAddModal = () => {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // Open edit product modal
  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image: product.image || "",
      description: product.description || "",
      status: product.status || "active",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Save product to Firebase
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const sku = form.sku.trim();
    const category = form.category.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!name || !sku || !category) {
      setError("Please complete all required product details.");
      return;
    }

    if (form.price === "" || !Number.isFinite(price) || price < 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("Stock must be a whole number equal to or greater than zero.");
      return;
    }

    if (form.image.trim()) {
      try {
        const imageUrl = new URL(form.image.trim());

        if (!["http:", "https:"].includes(imageUrl.protocol)) {
          throw new Error("Invalid image URL");
        }
      } catch {
        setError("Please enter a valid image URL beginning with https:// or http://.");
        return;
      }
    }

    try {
      setSaving(true);

      const now = Date.now();

      const productData = {
        name,
        sku,
        category,
        price,
        stock,
        image: form.image.trim(),
        description: form.description.trim(),
        status: form.status,
        updatedAt: now,
      };

      if (editingProduct) {
        await update(
          ref(db, `products/${editingProduct.id}`),
          productData
        );

        setSuccess("Product updated successfully.");
      } else {
        const newProductRef = push(ref(db, "products"));

        await set(newProductRef, {
          ...productData,
          createdAt: now,
        });

        setSuccess("Product added successfully.");
      }

      setModalOpen(false);
      setEditingProduct(null);
      setForm(INITIAL_FORM);
    } catch (firebaseError) {
      console.error("Product save error:", firebaseError);
      setError("Unable to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await remove(ref(db, `products/${product.id}`));
      setSuccess("Product deleted successfully.");

      window.setTimeout(() => setSuccess(""), 3000);
    } catch (firebaseError) {
      console.error("Product delete error:", firebaseError);
      setError("Unable to delete product. Please try again.");
    }
  };

  const getStockStatus = (stockValue) => {
    const stock = Number(stockValue || 0);

    if (stock <= 0) {
      return { label: "Out of stock", className: "out-of-stock" };
    }

    if (stock <= 5) {
      return { label: "Low stock", className: "low-stock" };
    }

    return { label: "In stock", className: "in-stock" };
  };

  const getProductStatus = (product) => {
    if (Number(product.stock || 0) <= 0) {
      return "Out of stock";
    }

    return product.status === "draft" ? "Draft" : "Active";
  };

  if (loading) {
    return (
      <div className="products-loading">
        <FiRefreshCw className="products-spinner" />
        <p>Loading your product inventory...</p>
      </div>
    );
  }

  return (
    <div className="admin-products">
      {/* PAGE HEADER */}
      <div className="products-header">
        <div>
          <span className="products-eyebrow">
            AURA / INVENTORY MANAGEMENT
          </span>

          <h1>Products</h1>

          <p>
            Manage your collection, monitor stock levels, and keep
            your product catalogue organized.
          </p>
        </div>

        <button
          type="button"
          className="add-product-btn"
          onClick={openAddModal}
        >
          <FiPlus />
          Add New Product
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {error && !modalOpen && (
        <div className="products-alert error">
          <FiAlertTriangle />
          {error}
          <button type="button" onClick={() => setError("")}>
            <FiX />
          </button>
        </div>
      )}

      {success && (
        <div className="products-alert success">
          <FiCheckCircle />
          {success}
          <button type="button" onClick={() => setSuccess("")}>
            <FiX />
          </button>
        </div>
      )}

      {/* OVERVIEW CARDS */}
      <section className="product-stats-grid">
        <article className="product-stat-card">
          <div className="product-stat-top">
            <span>Total Products</span>
            <div className="product-stat-icon total">
              <FiPackage />
            </div>
          </div>
          <h2>{totalProducts.toLocaleString("en-PK")}</h2>
          <p>Products in your catalogue</p>
        </article>

        <article className="product-stat-card">
          <div className="product-stat-top">
            <span>Active Products</span>
            <div className="product-stat-icon active">
              <FiCheckCircle />
            </div>
          </div>
          <h2>{activeProducts.toLocaleString("en-PK")}</h2>
          <p>Currently available products</p>
        </article>

        <article className="product-stat-card">
          <div className="product-stat-top">
            <span>Low Stock</span>
            <div className="product-stat-icon low">
              <FiAlertTriangle />
            </div>
          </div>
          <h2>{lowStockProducts.toLocaleString("en-PK")}</h2>
          <p>Products with 1–5 units remaining</p>
        </article>

        <article className="product-stat-card">
          <div className="product-stat-top">
            <span>Out of Stock</span>
            <div className="product-stat-icon empty">
              <FiXCircle />
            </div>
          </div>
          <h2>{outOfStockProducts.toLocaleString("en-PK")}</h2>
          <p>Products requiring restocking</p>
        </article>
      </section>

      {/* PRODUCT INVENTORY */}
      <section className="products-inventory-panel">
        <div className="inventory-heading">
          <div>
            <span className="products-eyebrow">YOUR COLLECTION</span>
            <h2>Product Inventory</h2>
            <p>View and manage all products in your store.</p>
          </div>

          <span className="inventory-count">
            {filteredProducts.length} Products
          </span>
        </div>

        {/* TOOLBAR */}
        <div className="products-toolbar">
          <div className="product-search">
            <FiSearch />
            <input
              type="search"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="product-filter">
            <FiLayers />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="product-filter">
            <FiFilter />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by product status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="products-table-wrapper">
          {filteredProducts.length > 0 ? (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="product-table-info">
                          <div className="product-table-image">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <FiImage />
                            )}
                          </div>

                          <div>
                            <strong>{product.name}</strong>
                            <span>
                              {product.description
                                ? product.description
                                : "No description"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="product-sku">
                        {product.sku || "—"}
                      </td>

                      <td>
                        <span className="product-category">
                          {product.category || "Uncategorized"}
                        </span>
                      </td>

                      <td className="product-price">
                        {formatPKR(product.price)}
                      </td>

                      <td>
                        <div className="product-stock">
                          <strong>{Number(product.stock || 0)}</strong>
                          <span className={`stock-label ${stockStatus.className}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`product-status ${
                            product.status === "draft"
                              ? "draft"
                              : Number(product.stock || 0) <= 0
                              ? "unavailable"
                              : "published"
                          }`}
                        >
                          {getProductStatus(product)}
                        </span>
                      </td>

                      <td>
                        <div className="admin-product-actions">
                          <button
                            type="button"
                            className="admin-product-edit-btn"
                            title="Edit product"
                            aria-label={`Edit ${product.name}`}
                            onClick={() => openEditModal(product)}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="admin-product-delete-btn"
                            title="Delete product"
                            aria-label={`Delete ${product.name}`}
                            onClick={() => handleDelete(product)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="products-empty">
              <div className="empty-icon">
                <FiBox />
              </div>

              <h3>No products found</h3>

              <p>
                {products.length === 0
                  ? "Your product catalogue is empty. Add your first product to get started."
                  : "Try changing your search or filters to find products."}
              </p>

              {products.length === 0 && (
                <button
                  type="button"
                  className="add-product-btn"
                  onClick={openAddModal}
                >
                  <FiPlus />
                  Add Your First Product
                </button>
              )}
            </div>
          )}
        </div>

        <div className="products-table-footer">
          <span>
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>
      </section>

      {/* ADD / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="product-modal-header">
              <div>
                <span className="products-eyebrow">
                  AURA / PRODUCT CATALOGUE
                </span>

                <h2 id="product-modal-title">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>

                <p>
                  {editingProduct
                    ? "Update your product information and inventory."
                    : "Add a new item to your AURA collection."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
              >
                <FiX />
              </button>
            </div>

            {error && (
              <div className="products-alert error modal-alert">
                <FiAlertTriangle />
                {error}
              </div>
            )}

            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-section-title">
                <FiPackage />
                Product Information
              </div>

              <div className="product-form-grid">
                <div className="product-form-group full-width">
                  <label htmlFor="product-name">
                    Product Name <span>*</span>
                  </label>

                  <input
                    id="product-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Classic Leather Bag"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-sku">
                    SKU <span>*</span>
                  </label>

                  <input
                    id="product-sku"
                    type="text"
                    name="sku"
                    placeholder="e.g. AURA-001"
                    value={form.sku}
                    onChange={handleChange}
                    required
                    maxLength={40}
                  />
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-category">
                    Category <span>*</span>
                  </label>

                  <input
                    id="product-category"
                    type="text"
                    name="category"
                    placeholder="e.g. Accessories"
                    value={form.category}
                    onChange={handleChange}
                    required
                    maxLength={60}
                    list="product-category-options"
                  />

                  <datalist id="product-category-options">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-price">
                    Price (PKR) <span>*</span>
                  </label>

                  <input
                    id="product-price"
                    type="number"
                    name="price"
                    placeholder="4500"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="product-form-group">
                  <label htmlFor="product-stock">
                    Stock Quantity <span>*</span>
                  </label>

                  <input
                    id="product-stock"
                    type="number"
                    name="stock"
                    placeholder="20"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="product-form-group full-width">
                  <label htmlFor="product-image">
                    Product Image URL
                  </label>

                  <input
                    id="product-image"
                    type="url"
                    name="image"
                    placeholder="https://example.com/product-image.jpg"
                    value={form.image}
                    onChange={handleChange}
                  />

                  <small>
                    Paste a publicly accessible image URL.
                  </small>
                </div>

                {form.image && (
                  <div className="product-image-preview full-width">
                    <img
                      src={form.image}
                      alt="Product preview"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="product-form-group full-width">
                  <label htmlFor="product-description">
                    Product Description
                  </label>

                  <textarea
                    id="product-description"
                    name="description"
                    placeholder="Write a short description about this product..."
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="product-form-group full-width">
                  <label htmlFor="product-status">
                    Product Visibility
                  </label>

                  <select
                    id="product-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active — Visible in store</option>
                    <option value="draft">Draft — Hidden from store</option>
                  </select>
                </div>
              </div>

              <div className="product-form-actions">
                <button
                  type="button"
                  className="cancel-product-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="products-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      {editingProduct ? "Update Product" : "Save Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;