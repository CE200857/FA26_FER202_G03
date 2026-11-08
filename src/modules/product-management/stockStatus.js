export const LOW_STOCK_THRESHOLD = 5;

/** Label and tone ('ok' | 'low' | 'out') for a product's stock level. */
export function getStockInfo(stock) {
  if (stock === 0) return { label: 'Hết hàng', tone: 'out' };
  if (stock <= LOW_STOCK_THRESHOLD) return { label: `Còn ${stock} sản phẩm`, tone: 'low' };
  return { label: 'Còn hàng', tone: 'ok' };
}