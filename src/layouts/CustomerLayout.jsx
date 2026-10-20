import { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';

const CustomerLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <div className="app-shell customer-layout">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand-logo">
            Spa & Salon Cosmetics
          </Link>

          <nav className="main-nav">
            <NavLink to="/products">Sản phẩm</NavLink>
            <NavLink to="/vouchers">Voucher</NavLink>
            <NavLink to="/orders/history">Đơn hàng</NavLink>
            <NavLink to="/profile">Tài khoản</NavLink>
            <NavLink to="/admin">Quản trị</NavLink>
          </nav>

          <button
            type="button"
            className="cart-btn"
            onClick={() => setIsCartOpen((previous) => !previous)}
            aria-label={
              totalItems > 0
                ? `Mở giỏ hàng, có ${totalItems} sản phẩm`
                : 'Mở giỏ hàng'
            }
          >
            <span aria-hidden="true">🛒</span>
            Giỏ hàng
          </button>
        </div>
      </header>

      <main className="site-main container">
        <Outlet context={{ isCartOpen, setIsCartOpen }} />
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLayout;