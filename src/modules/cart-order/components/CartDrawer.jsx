import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { AuthContext } from '../../../context/AuthContext';
import { useToast } from '../../../components/common/Toast';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { formatCurrency } from '../../../utils/formatCurrency';
import CartSummary from './CartSummary';
import '../cart-order.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const {
    cartItems,
    subtotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    isLoading,
    isUpdating,
    error,
    reloadCart,
  } = useCart();

  const { isAuthenticated } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [confirmClear, setConfirmClear] = useState(false);

  const isBusy = isLoading || isUpdating;

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
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

  const handleRemove = async (item) => {
    const success = await removeFromCart(item.id);

    if (success) {
      toast.info(`Đã xóa "${item.name}" khỏi giỏ hàng.`);
    }
  };

  const handleClear = async () => {
    if (isBusy) return;

    const success = await clearCart();

    if (success) {
      setConfirmClear(false);
      toast.info('Đã xóa toàn bộ giỏ hàng.');
    }
  };

  return (
    <>
      <div
        className="cart-backdrop"
        onClick={onClose}
        role="presentation"
      />

      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Giỏ hàng"
      >
        <div className="cart-drawer__header">
          <h2>Giỏ hàng ({cartItems.length})</h2>

          <button
            type="button"
            className="cart-icon-btn"
            onClick={onClose}
            aria-label="Đóng giỏ hàng"
          >
            ×
          </button>
        </div>

        <div className="cart-drawer__body">
          {isLoading && (
            <p role="status">Đang tải giỏ hàng...</p>
          )}

          {isUpdating && (
            <p role="status">Đang lưu giỏ hàng...</p>
          )}

          {error && (
            <div role="alert">
              <p>{error}</p>

              <button
                type="button"
                onClick={reloadCart}
                disabled={isBusy}
              >
                Thử lại
              </button>
            </div>
          )}

          {!isLoading && !error && cartItems.length === 0 ? (
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
                  <p className="cart-item__name">
                    {item.name}
                  </p>

                  <p className="cart-item__price">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="cart-item__row">
                    <div className="qty-control">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(
                            item.id,
                            item.quantity - 1
                          )
                        }
                        disabled={isBusy || item.quantity <= 1}
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(
                            item.id,
                            item.quantity + 1
                          )
                        }
                        disabled={
                          isBusy || item.quantity >= item.stock
                        }
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>

                    <strong>
                      {formatCurrency(
                        item.price * item.quantity
                      )}
                    </strong>

                    <button
                      type="button"
                      className="link-danger"
                      disabled={isBusy}
                      onClick={() => handleRemove(item)}
                    >
                      Xóa
                    </button>
                  </div>

                  {item.quantity >= item.stock && (
                    <p className="cart-note">
                      Đã đạt số lượng tối đa trong kho (
                      {item.stock}).
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer__footer">
            <CartSummary subtotal={subtotal} />

            <button
              type="button"
              className="co-btn co-btn--primary"
              disabled={isBusy || !!error}
              onClick={handleCheckout}
            >
              Thanh toán
            </button>

            <button
              type="button"
              className="co-btn co-btn--ghost"
              disabled={isBusy}
              onClick={() => setConfirmClear(true)}
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </div>
        )}
      </aside>

      <ConfirmModal
        isOpen={confirmClear}
        title="Xóa toàn bộ giỏ hàng?"
        message="Tất cả sản phẩm trong giỏ sẽ bị xóa. Bạn có chắc chắn không?"
        confirmText="Xóa hết"
        danger
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
};

export default CartDrawer;