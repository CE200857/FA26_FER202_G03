import { formatCurrency } from '../../../utils/formatCurrency';
import '../cart-order.css';

const CartSummary = ({ subtotal = 0, discountAmount = 0, voucherCode = null }) => {
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <div className="cart-summary">
      <div className="cart-summary__row">
        <span>Tạm tính</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="cart-summary__row cart-summary__row--discount">
          <span>Voucher{voucherCode ? ` (${voucherCode})` : ''}</span>
          <span>-{formatCurrency(discountAmount)}</span>
        </div>
      )}
      <div className="cart-summary__row cart-summary__row--total">
        <span>Tổng cộng</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default CartSummary;