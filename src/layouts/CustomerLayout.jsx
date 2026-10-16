import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';

const CustomerLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems, subtotal } = useCart();

  return (
    <div className="app-shell customer-layout">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand-logo">Spa & Salon Cosmetics</Link>
          <nav className="main-nav">
            <Link to="/products">Sản phẩm</Link>
            <Link to="/vouchers">Voucher</Link>
            <Link to="/orders/history">Đơn hàng</Link>
            <Link to="/profile">Tài khoản</Link>
            <Link to="/admin">Quản trị (Admin)</Link>
          </nav>
          <button type="button" className="cart-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
            Giỏ hàng ({totalItems}) - {formatCurrency(subtotal)}
          </button>
        </div>
      </header>

      <main className="site-main container">
        <Outlet context={{ isCartOpen, setIsCartOpen }} />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© 2026 Group 3 – Spa & Salon Cosmetics Retail System</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;