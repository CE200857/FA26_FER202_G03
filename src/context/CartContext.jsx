import { createContext, useContext, useState, useMemo } from 'react';
import { cartService } from '../services/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => cartService.getCart());

  const addToCart = (product, quantity = 1) => {
    const updated = cartService.addItem(product, quantity);
    setCartItems([...updated]);
  };

  const updateCartQuantity = (productId, quantity) => {
    const updated = cartService.updateQuantity(productId, quantity);
    setCartItems([...updated]);
  };

  const removeFromCart = (productId) => {
    const updated = cartService.removeItem(productId);
    setCartItems([...updated]);
  };

  const clearCart = () => {
    const updated = cartService.clearCart();
    setCartItems([...updated]);
  };

  const { totalItems, subtotal } = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + item.quantity,
        subtotal: acc.subtotal + item.price * item.quantity,
      }),
      { totalItems: 0, subtotal: 0 }
    );
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        subtotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider');
  }
  return context;
};