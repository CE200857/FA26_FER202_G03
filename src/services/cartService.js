import axios from 'axios';

export const cartApi = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:5001',
  timeout: 10000,
});

const queues = new Map();

const cartPath = (cartId) =>
  `/carts/${encodeURIComponent(cartId)}`;

const sameProduct = (item, productId) =>
  String(item.id) === String(productId);

function forUser(userId, operation) {
  if (userId == null || String(userId).trim() === '') {
    return Promise.reject(
      new Error('Vui lòng đăng nhập để sử dụng giỏ hàng.')
    );
  }

  const id = String(userId);
  const previous = queues.get(id) || Promise.resolve();
  const result = previous.then(() => operation(id));

  const settled = result.then(
    () => undefined,
    () => undefined
  );

  queues.set(id, settled);

  settled.then(() => {
    if (queues.get(id) === settled) {
      queues.delete(id);
    }
  });

  return result;
}

function itemsOf(record) {
  if (!Array.isArray(record.items)) {
    throw new Error('Dữ liệu giỏ hàng không hợp lệ.');
  }

  return record.items;
}

async function readCart(userId) {
  const { data } = await cartApi.get('/carts', {
    params: { userId },
  });

  if (!Array.isArray(data)) {
    throw new Error('Dữ liệu giỏ hàng không hợp lệ.');
  }

  const record = data[0] || null;

  if (record) {
    itemsOf(record);
  }

  return record;
}

async function saveCart(userId, record, items) {
  const { data } = record
    ? await cartApi.patch(cartPath(record.id), { items })
    : await cartApi.post('/carts', { userId, items });

  return itemsOf(data);
}

function validQuantity(value) {
  const quantity = Number(value);

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new Error('Số lượng phải là số nguyên lớn hơn 0.');
  }

  return quantity;
}

async function currentProduct(productId) {
  if (productId == null || String(productId).trim() === '') {
    throw new Error('Sản phẩm không hợp lệ.');
  }

  let product;

  try {
    const { data } = await cartApi.get(
      `/products/${encodeURIComponent(productId)}`
    );

    product = data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Sản phẩm không còn tồn tại.');
    }

    throw error;
  }

  if (product.isHidden) {
    throw new Error('Sản phẩm hiện không còn được bán.');
  }

  return product;
}

function cartItem(product, quantity) {
  const stock = Number(product.stock);
  const price = Number(product.price);

  if (
    !Number.isSafeInteger(stock) ||
    stock < 0 ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    throw new Error('Giá hoặc tồn kho sản phẩm không hợp lệ.');
  }

  if (quantity > stock) {
    throw new Error(
      `Sản phẩm chỉ còn ${stock} trong kho. Vui lòng chọn lại số lượng.`
    );
  }

  return {
    id: product.id,
    name: product.name,
    price,
    image: product.image,
    stock,
    quantity,
  };
}

export const cartService = {
  async getCart(userId) {
    return forUser(userId, async (id) => {
      const record = await readCart(id);
      return record ? record.items : [];
    });
  },

  async addItem(userId, product, quantity = 1) {
    return forUser(userId, async (id) => {
      const addedQuantity = validQuantity(quantity);
      const record = await readCart(id);
      const items = record?.items || [];

      // Lấy giá và tồn kho hiện tại từ API.
      const latest = await currentProduct(product?.id);

      const existing = items.find((item) =>
        sameProduct(item, latest.id)
      );

      const nextQuantity =
        addedQuantity +
        (existing ? validQuantity(existing.quantity) : 0);

      const updatedItem = cartItem(latest, nextQuantity);

      const updated = existing
        ? items.map((item) =>
            sameProduct(item, latest.id) ? updatedItem : item
          )
        : [...items, updatedItem];

      return saveCart(id, record, updated);
    });
  },

  async updateQuantity(userId, productId, quantity) {
    return forUser(userId, async (id) => {
      const count = validQuantity(quantity);
      const record = await readCart(id);

      const exists = record?.items.some((item) =>
        sameProduct(item, productId)
      );

      if (!exists) {
        throw new Error('Sản phẩm không có trong giỏ hàng.');
      }

      const latest = await currentProduct(productId);
      const updatedItem = cartItem(latest, count);

      const updated = record.items.map((item) =>
        sameProduct(item, productId) ? updatedItem : item
      );

      return saveCart(id, record, updated);
    });
  },

  async removeItem(userId, productId) {
    return forUser(userId, async (id) => {
      const record = await readCart(id);

      if (!record) return [];

      const updated = record.items.filter(
        (item) => !sameProduct(item, productId)
      );

      return saveCart(id, record, updated);
    });
  },

  async clearCart(userId) {
    return forUser(userId, async (id) => {
      const record = await readCart(id);

      return record
        ? saveCart(id, record, [])
        : [];
    });
  },
};