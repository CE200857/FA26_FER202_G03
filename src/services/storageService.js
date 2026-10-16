export const STORAGE_KEYS = {
  PRODUCTS: 'spa_products',
  USERS: 'spa_users',
  CURRENT_USER: 'spa_current_user',
  CART: 'spa_cart',
  ORDERS: 'spa_orders',
  VOUCHERS: 'spa_vouchers',
  REVIEWS: 'spa_reviews',
};

export const storageService = {
  get(key, defaultValue = []) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  initSeedData(seedMap) {
    Object.entries(seedMap).forEach(([key, initialData]) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(initialData));
      }
    });
  },
};