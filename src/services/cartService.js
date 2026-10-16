import { STORAGE_KEYS, storageService } from './storageService';

export const cartService = {
  getCart() {
    return storageService.get(STORAGE_KEYS.CART, []);
  },

  saveCart(cartItems) {
    storageService.set(STORAGE_KEYS.CART, cartItems);
    return cartItems;
  },

  addItem(product, quantity = 1) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    const maxStock = Number(product.stock ?? 0);

    if (existingIndex > -1) {
      const nextQty = Math.min(cart[existingIndex].quantity + quantity, maxStock);
      cart[existingIndex].quantity = nextQty;
    } else if (maxStock > 0) {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        stock: maxStock,
        quantity: Math.min(quantity, maxStock),
      });
    }
    return this.saveCart(cart);
  },

  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const updated = cart
      .map((item) => {
        if (item.id !== productId) return item;
        const validQty = Math.max(1, Math.min(Number(quantity), Number(item.stock)));
        return { ...item, quantity: validQty };
      });
    return this.saveCart(updated);
  },

  removeItem(productId) {
    const filtered = this.getCart().filter((item) => item.id !== productId);
    return this.saveCart(filtered);
  },

  clearCart() {
    return this.saveCart([]);
  },
};