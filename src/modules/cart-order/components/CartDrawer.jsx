import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { AuthContext } from '../../../context/AuthContext';
import { useToast } from '../../../components/common/Toast';
import { formatCurrency } from '../../../utils/formatCurrency';
import CartSummary from './CartSummary';
import '../cart-order.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, subtotal } = useCart();
  const { isAuthenticated } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để tiến hành thanh toán.');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} role="presentation" />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Giỏ hàng">
        <div className="cart-drawer__header">
          <h2>Giỏ hàng ({cartItems.length})</h2>
          <button type="button" className="cart-icon-btn" onClick={onClose} aria-label="Đóng giỏ hàng">
            ×
          </button>
        </div>

        <div className="cart-drawer__body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Giỏ hàng của bạn đang trống.</p>
              <button
                type="button"
                className="co-btn co-btn--ghost"
                onClick={() => {
                  onClose();
                  navigate('/products');
                }}
              >
                Xem sản phẩm
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <p className="cart-item__name">{item.name}</p>
                  <p className="cart-item__price">{formatCurrency(item.price)}</p>
                  <div className="cart-item__row">
                    <span>Số lượng: {item.quantity}</span>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer__footer">
            <CartSummary subtotal={subtotal} />
            <button type="button" className="co-btn co-btn--primary" onClick={handleCheckout}>
              Thanh toán
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;