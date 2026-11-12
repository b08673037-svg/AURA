export const formatPKR = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const getStockStatus = (stock, threshold = 5) => {
  const qty = Number(stock) || 0;
  if (qty === 0) return "Out of Stock";
  if (qty <= threshold) return "Low Stock";
  return "In Stock";
};

export const filterAndSortProducts = (products, filters) => {
  let result = [...products];

  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.id?.toLowerCase().includes(query)
    );
  }

  if (filters.category && filters.category !== "all") {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.status && filters.status !== "all") {
    result = result.filter(
      (p) => String(p.status || "draft").toLowerCase() === filters.status
    );
  }

  if (filters.stock && filters.stock !== "all") {
    result = result.filter((p) => {
      const status = getStockStatus(p.stock || 0, p.lowStockThreshold || 5);
      if (filters.stock === "in") return status === "In Stock";
      if (filters.stock === "low") return status === "Low Stock";
      if (filters.stock === "out") return status === "Out of Stock";
      return true;
    });
  }

  switch (filters.sort) {
    case "newest":
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
    case "oldest":
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      break;
    case "price-high":
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      break;
    case "price-low":
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      break;
    case "stock-high":
      result.sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0));
      break;
    default:
      break;
  }

  return result;
};