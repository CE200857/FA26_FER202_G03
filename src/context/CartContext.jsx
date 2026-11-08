import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AuthContext } from './AuthContext';
import { useToast } from '../components/common/Toast';
import { cartService } from '../services/cartService';

const CartContext = createContext(null);

const emptyCart = (ownerId) => ({
  ownerId,
  items: [],
  loading: false,
  pending: 0,
  error: '',
});

const errorMessage = (error) =>
  error.response || error.request
    ? 'Không thể kết nối đến giỏ hàng. Vui lòng thử lại.'
    : error.message || 'Không thể cập nhật giỏ hàng.';

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const userId = user?.id == null ? null : String(user.id);

  const [cart, setCart] = useState(() => emptyCart(null));

  const session = useRef(0);

  const reloadCart = useCallback(async () => {
    if (!userId) return false;

    const ownerSession = session.current;

    setCart((previous) => ({
      ...previous,
      ownerId: userId,
      loading: true,
      error: '',
    }));

    try {
      const items = await cartService.getCart(userId);

      if (ownerSession !== session.current) return false;

      setCart((previous) => ({
        ...previous,
        items,
        loading: false,
        error: '',
      }));

      return true;
    } catch (error) {
      if (ownerSession !== session.current) return false;

      setCart((previous) => ({
        ...previous,
        loading: false,
        error: errorMessage(error),
      }));

      return false;
    }
  }, [userId]);

  useEffect(() => {
    session.current += 1;

    setCart(emptyCart(userId));
    reloadCart();

    return () => {
      session.current += 1;
    };
  }, [userId, reloadCart]);

  const mutateCart = async (operation) => {
    if (!userId) {
      toast.info('Vui lòng đăng nhập để sử dụng giỏ hàng.');
      return false;
    }

    const ownerSession = session.current;

    setCart((previous) => ({
      ...previous,
      loading: false,
      pending: previous.pending + 1,
      error: '',
    }));

    try {
      const items = await operation(userId);

      if (ownerSession !== session.current) return false;

      setCart((previous) => ({
        ...previous,
        items,
        error: '',
      }));

      return true;
    } catch (error) {
      if (ownerSession !== session.current) return false;

      const message = errorMessage(error);

      setCart((previous) => ({
        ...previous,
        error: message,
      }));

      toast.error(message);

      return false;
    } finally {
      if (ownerSession === session.current) {
        setCart((previous) => ({
          ...previous,
          pending: Math.max(0, previous.pending - 1),
        }));
      }
    }
  };

  const visibleCart =
    cart.ownerId === userId ? cart : emptyCart(userId);

  const cartItems = visibleCart.items;

  const { totalItems, subtotal } = useMemo(
    () =>
      cartItems.reduce(
        (totals, item) => ({
          totalItems: totals.totalItems + Number(item.quantity),
          subtotal:
            totals.subtotal +
            Number(item.price) * Number(item.quantity),
        }),
        { totalItems: 0, subtotal: 0 }
      ),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        subtotal,

        isLoading:
          !!userId &&
          (cart.ownerId !== userId || visibleCart.loading),

        isUpdating: visibleCart.pending > 0,
        error: visibleCart.error,
        reloadCart,

        addToCart: (product, quantity = 1) =>
          mutateCart((id) =>
            cartService.addItem(id, product, quantity)
          ),

        updateCartQuantity: (productId, quantity) =>
          mutateCart((id) =>
            cartService.updateQuantity(id, productId, quantity)
          ),

        removeFromCart: (productId) =>
          mutateCart((id) =>
            cartService.removeItem(id, productId)
          ),

        clearCart: () =>
          mutateCart((id) => cartService.clearCart(id)),

        clearCartAfterOrder: async (orderItems) => {
          let cleared = false;
          const success = await mutateCart(async (id) => {
            const result = await cartService.clearCartAfterOrder(id, orderItems);
            cleared = result.cleared;
            return result.items;
          });
          return success && cleared;
        },
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart phải được sử dụng bên trong CartProvider'
    );
  }

  return context;
};