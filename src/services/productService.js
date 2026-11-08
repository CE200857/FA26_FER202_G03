import { request } from './api';
import { STORAGE_KEYS, storageService } from './storageService';
import { normalizeProductInput, validateProduct } from '../modules/product-management/productValidation';

const NOT_FOUND_MESSAGE = 'Không tìm thấy sản phẩm. Có thể sản phẩm đã bị xóa.';
const MAX_CREATE_ATTEMPTS = 3;

// Business rule: only a Manager (role "Admin") may create, update or delete products.
// json-server has no login of its own, so this is a client-side guard for the mock backend.
function assertManager() {
  const currentUser = storageService.get(STORAGE_KEYS.CURRENT_USER, null);
  if (currentUser?.role !== 'Admin') {
    throw new Error('Chỉ quản trị viên (Manager) mới được thêm, sửa hoặc xóa sản phẩm.');
  }
}

function assertValid(input) {
  const errors = validateProduct(input);
  if (Object.keys(errors).length > 0) {
    throw Object.assign(new Error('Dữ liệu sản phẩm không hợp lệ.'), { errors });
  }
}

// Turns a 404 from the API into a clear message; other errors pass through unchanged.
async function requestProduct(id, options) {
  try {
    return await request(`/products/${encodeURIComponent(id)}`, options);
  } catch (error) {
    if (error.status === 404) throw new Error(NOT_FOUND_MESSAGE);
    throw error;
  }
}

// Next id like "P007". Ids still referenced by orders or reviews are never
// reused, so a deleted product's reviews can't attach to a new product.
async function nextProductId() {
  const [products, reviews, orders] = await Promise.all([
    request('/products'),
    request('/reviews'),
    request('/orders'),
  ]);
  const usedIds = [
    ...products.map((product) => product.id),
    ...reviews.map((review) => review.productId),
    ...orders.flatMap((order) => (order.items ?? []).map((item) => item.productId)),
  ];
  const highest = usedIds.reduce((max, id) => {
    const number = Number(String(id ?? '').replace(/\D/g, ''));
    return Number.isFinite(number) && number > max ? number : max;
  }, 0);
  return `P${String(highest + 1).padStart(3, '0')}`;
}

/**
 * Returns all products. Hidden products (isHidden: true) are left out
 * unless includeHidden is true (admin pages).
 */
export async function getProducts({ includeHidden = false } = {}) {
  const all = await request('/products');
  return includeHidden ? all : all.filter((product) => !product.isHidden);
}

/**
 * Returns one product by id (e.g. 'P001'), or null if it does not exist.
 * A hidden product counts as missing for customers.
 */
export async function getProductById(id, { includeHidden = false } = {}) {
  try {
    const product = await request(`/products/${encodeURIComponent(id)}`);
    return product.isHidden && !includeHidden ? null : product;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

/** Creates a product. Throws an Error (with .errors for field messages) if invalid. */
export async function createProduct(data) {
  assertManager();
  assertValid(data);
  const fields = normalizeProductInput(data);

  for (let attempt = 1; ; attempt += 1) {
    const product = {
      id: await nextProductId(),
      ...fields,
      isHidden: false,
      createdAt: new Date().toISOString(),
    };
    try {
      return await request('/products', { method: 'POST', body: JSON.stringify(product) });
    } catch (error) {
      // Two admins saving at the same moment can pick the same id: try again with a fresh one.
      // (A network failure has no status and is not retried.)
      if (!error.status || attempt >= MAX_CREATE_ATTEMPTS) throw error;
    }
  }
}

/** Updates the editable fields (name, brand, category, price, stock, image, description). */
export async function updateProduct(id, changes) {
  assertManager();

  const existing = await requestProduct(id);
  const input = { ...existing, ...changes };
  assertValid(input);

  return requestProduct(id, {
    method: 'PATCH',
    body: JSON.stringify({ ...normalizeProductInput(input), updatedAt: new Date().toISOString() }),
  });
}

/** Hides (true) or shows (false) a product for customers without deleting it. */
export async function setProductHidden(id, isHidden) {
  assertManager();

  return requestProduct(id, {
    method: 'PATCH',
    body: JSON.stringify({ isHidden: Boolean(isHidden), updatedAt: new Date().toISOString() }),
  });
}

/** Permanently deletes a product. Returns the deleted id. */
export async function deleteProduct(id) {
  assertManager();

  await requestProduct(id, { method: 'DELETE' });
  return id;
}