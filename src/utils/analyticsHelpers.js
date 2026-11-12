
export const formatPKR = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);


// Convert different Firebase date formats into a JavaScript Date.
export const getOrderDate = (order) => {
  const value =
    order.createdAt ??
    order.date ??
    order.timestamp ??
    order.orderDate;

  if (!value) return null;

  let date;

  if (typeof value === "object" && value.seconds) {
    date = new Date(value.seconds * 1000);
  } else if (typeof value === "number") {
    date = new Date(value < 100000000000 ? value * 1000 : value);
  } else {
    date = new Date(value);
  }

  return Number.isNaN(date.getTime()) ? null : date;
};


// Read the order status consistently.
export const getOrderStatus = (order) => {
  const status = String(
    order.status || order.orderStatus || "pending"
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  return status;
};


// Get the order's saved total.
export const getOrderAmount = (order) => {
  const amount = Number(
    order.totalAmount ??
    order.grandTotal ??
    order.total ??
    order.amount ??
    0
  );

  return Number.isFinite(amount) ? amount : 0;
};


// Revenue rules.
export const isRevenueOrder = (order) => {
  const status = getOrderStatus(order);

  const paymentStatus = String(
    order.paymentStatus || order.payment?.status || ""
  ).toLowerCase();

  const excludedStatuses = [
    "cancelled",
    "canceled",
    "refunded",
    "failed",
  ];

  if (excludedStatuses.includes(status)) return false;

  if (
    ["cancelled", "canceled", "refunded", "failed"].includes(
      paymentStatus
    )
  ) {
    return false;
  }

  return (
    ["completed", "delivered", "paid"].includes(status) ||
    paymentStatus === "paid"
  );
};


// Date range helper.
export const getDateRange = (filterType) => {
  const now = new Date();

  let start = new Date(now);
  let end = new Date(now);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  switch (filterType) {
    case "today":
      break;

    case "yesterday":
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;

    case "last7":
      start.setDate(start.getDate() - 6);
      break;

    case "last30":
      start.setDate(start.getDate() - 29);
      break;

    case "thisMonth":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case "lastMonth":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "thisYear":
      start = new Date(now.getFullYear(), 0, 1);
      break;

    default:
      start.setDate(start.getDate() - 29);
  }

  return { start, end };
};


// Filter orders using their actual date.
export const filterOrdersByDate = (orders, start, end) => {
  return orders.filter((order) => {
    const date = getOrderDate(order);

    if (!date) return false;

    return date >= start && date <= end;
  });
};


// Get order items regardless of whether Firebase stores an array or object.
export const getOrderItems = (order) => {
  const items = order.items || order.products || [];

  if (Array.isArray(items)) return items;

  if (items && typeof items === "object") {
    return Object.values(items);
  }

  return [];
};


// Get a product's unit price from common order item fields.
const getItemPrice = (item) => {
  return Number(
    item.price ??
    item.unitPrice ??
    item.salePrice ??
    item.productPrice ??
    0
  ) || 0;
};


// Create a date-based revenue chart.
export const generateRevenueChartData = (orders, filterType) => {
  const { start, end } = getDateRange(filterType);

  const buckets = [];

  const addBucket = (date, label) => {
    buckets.push({
      dateKey: date.toDateString(),
      label,
      revenue: 0,
      orders: 0,
    });
  };

  // Year view: monthly buckets.
  if (filterType === "thisYear") {
    for (let month = 0; month < 12; month++) {
      const date = new Date(start.getFullYear(), month, 1);

      addBucket(
        date,
        date.toLocaleString("en", { month: "short" })
      );
    }

    orders.forEach((order) => {
      const date = getOrderDate(order);
      if (!date || date.getFullYear() !== start.getFullYear()) return;

      const bucket = buckets[date.getMonth()];

      if (bucket) {
        bucket.revenue += getOrderAmount(order);
        bucket.orders += 1;
      }
    });

    return buckets;
  }

  // Daily buckets for shorter date ranges.
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  const finalDate = new Date(end);
  finalDate.setHours(0, 0, 0, 0);

  while (cursor <= finalDate) {
    const date = new Date(cursor);

    addBucket(
      date,
      filterType === "today" || filterType === "yesterday"
        ? date.toLocaleTimeString("en", {
            hour: "numeric",
            hour12: true,
          })
        : date.toLocaleDateString("en", {
            day: "numeric",
            month: "short",
          })
    );

    cursor.setDate(cursor.getDate() + 1);
  }

  orders.forEach((order) => {
    const date = getOrderDate(order);
    if (!date) return;

    const bucket = buckets.find(
      (item) => item.dateKey === date.toDateString()
    );

    if (bucket) {
      bucket.revenue += getOrderAmount(order);
      bucket.orders += 1;
    }
  });

  return buckets;
};


// Sales by category.
// Uses actual line-item prices and quantities.
export const generateCategoryData = (orders) => {
  const categories = {};

  orders.filter(isRevenueOrder).forEach((order) => {
    const items = getOrderItems(order);

    items.forEach((item) => {
      const category = item.category || "Uncategorized";

      const quantity = Math.max(
        0,
        Number(item.quantity ?? 1) || 0
      );

      const revenue = getItemPrice(item) * quantity;

      if (!categories[category]) {
        categories[category] = 0;
      }

      categories[category] += revenue;
    });
  });

  return Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
};


// Top-selling products.
export const generateTopProducts = (orders) => {
  const products = {};

  orders.filter(isRevenueOrder).forEach((order) => {
    const items = getOrderItems(order);

    items.forEach((item) => {
      const id =
        item.productId ||
        item.id ||
        item.sku ||
        item.name;

      if (!id) return;

      const quantity = Math.max(
        0,
        Number(item.quantity ?? 1) || 0
      );

      const unitPrice = getItemPrice(item);

      if (!products[id]) {
        products[id] = {
          id,
          name: item.name || item.productName || "Unnamed product",
          image:
            item.image ||
            item.imageUrl ||
            item.images?.[0] ||
            null,
          sales: 0,
          revenue: 0,
        };
      }

      products[id].sales += quantity;
      products[id].revenue += unitPrice * quantity;
    });
  });

  return Object.values(products)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};


// Order status statistics.
export const getOrderCounts = (orders) => {
  const counts = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  };

  orders.forEach((order) => {
    const status = getOrderStatus(order);

    if (status === "confirmed") {
      counts.processing += 1;
    } else if (status === "in-transit") {
      counts.shipped += 1;
    } else if (status === "complete") {
      counts.delivered += 1;
    } else if (status === "canceled") {
      counts.cancelled += 1;
    } else if (Object.prototype.hasOwnProperty.call(counts, status)) {
      counts[status] += 1;
    }
  });

  return counts;
};
