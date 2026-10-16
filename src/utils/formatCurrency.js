export const formatCurrency = (amount) => {
  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(numericAmount);
};