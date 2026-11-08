import { LOW_STOCK_THRESHOLD } from './stockStatus';

export const ORDER_STATUSES = [
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Shipping', label: 'Đang giao' },
  { value: 'Completed', label: 'Hoàn thành' },
  { value: 'Cancelled', label: 'Đã hủy' },
];

const asList = (value) => (Array.isArray(value) ? value : []);
const stockOf = (product) => Math.max(0, Number(product.stock) || 0);
const timeOf = (value) => Date.parse(value) || 0;

/** Stock numbers for the dashboard. Hidden products are not counted as "visible". */
export function summarizeInventory(products) {
  const all = asList(products);
  const visible = all.filter((product) => !product.isHidden);
  const outOfStock = visible.filter((product) => stockOf(product) === 0);
  const lowStock = visible.filter(
    (product) => stockOf(product) > 0 && stockOf(product) <= LOW_STOCK_THRESHOLD,
  );

  return {
    total: all.length,
    visible: visible.length,
    hidden: all.length - visible.length,
    outOfStock: outOfStock.length,
    lowStock: lowStock.length,
    stockValue: visible.reduce((sum, product) => sum + stockOf(product) * (Number(product.price) || 0), 0),
    // Products that need restocking first: lowest stock on top.
    needsRestock: [...outOfStock, ...lowStock].sort(
      (a, b) => stockOf(a) - stockOf(b) || String(a.name).localeCompare(String(b.name), 'vi'),
    ),
  };
}

/** Order counts per status, revenue from Completed orders, and the 5 newest orders. */
export function summarizeOrders(orders) {
  const all = asList(orders);
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status.value, 0]));
  all.forEach((order) => {
    if (order.status in byStatus) byStatus[order.status] += 1;
  });

  return {
    total: all.length,
    byStatus,
    revenue: all
      .filter((order) => order.status === 'Completed')
      .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0),
    recent: [...all].sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt)).slice(0, 5),
  };
}

/** Review count and average rating (hidden reviews are left out of both). */
export function summarizeReviews(reviews) {
  const all = asList(reviews);
  const visible = all.filter((review) => !review.isHidden);
  const ratings = visible.map((review) => Number(review.rating)).filter((rating) => rating >= 1 && rating <= 5);

  return {
    visible: visible.length,
    hidden: all.length - visible.length,
    average: ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null,
  };
}