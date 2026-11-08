export const LIMITS = {
  name: 120,
  brand: 60,
  category: 60,
  description: 1000,
  maxPrice: 1_000_000_000,
  maxStock: 100_000,
};

const toNumber = (value) =>
  value === '' || value === null || value === undefined ? NaN : Number(value);

/**
 * Validates the product form fields.
 * Returns an object of error messages keyed by field name ({} when valid).
 * Business rules: price must be > 0, stock can never be negative.
 */
export function validateProduct(data) {
  const errors = {};
  const name = String(data.name ?? '').trim();
  const brand = String(data.brand ?? '').trim();
  const category = String(data.category ?? '').trim();
  const image = String(data.image ?? '').trim();
  const description = String(data.description ?? '').trim();

  if (!name) errors.name = 'Vui lòng nhập tên sản phẩm.';
  else if (name.length > LIMITS.name) errors.name = `Tên sản phẩm tối đa ${LIMITS.name} ký tự.`;

  if (!brand) errors.brand = 'Vui lòng nhập thương hiệu.';
  else if (brand.length > LIMITS.brand) errors.brand = `Thương hiệu tối đa ${LIMITS.brand} ký tự.`;

  if (!category) errors.category = 'Vui lòng nhập danh mục.';
  else if (category.length > LIMITS.category) errors.category = `Danh mục tối đa ${LIMITS.category} ký tự.`;

  const price = toNumber(data.price);
  if (Number.isNaN(price)) errors.price = 'Vui lòng nhập giá.';
  else if (!Number.isInteger(price) || price <= 0) errors.price = 'Giá phải là số nguyên lớn hơn 0.';
  else if (price > LIMITS.maxPrice) errors.price = 'Giá quá lớn, vui lòng kiểm tra lại.';

  const stock = toNumber(data.stock);
  if (Number.isNaN(stock)) errors.stock = 'Vui lòng nhập số lượng tồn kho.';
  else if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Tồn kho phải là số nguyên từ 0 trở lên.';
  else if (stock > LIMITS.maxStock) errors.stock = 'Số lượng tồn kho quá lớn, vui lòng kiểm tra lại.';

  if (image && !/^(https?:\/\/|\/)/i.test(image)) {
    errors.image = 'Link ảnh phải bắt đầu bằng http://, https:// hoặc /.';
  }

  if (description.length > LIMITS.description) {
    errors.description = `Mô tả tối đa ${LIMITS.description} ký tự.`;
  }

  return errors;
}

/** Trims text and converts price/stock to numbers. Call only after validateProduct passes. */
export function normalizeProductInput(data) {
  return {
    name: String(data.name).trim(),
    brand: String(data.brand).trim(),
    category: String(data.category).trim(),
    price: Number(data.price),
    stock: Number(data.stock),
    image: String(data.image ?? '').trim(),
    description: String(data.description ?? '').trim(),
  };
}