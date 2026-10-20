import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';

const pageTitles = {
  '/admin': 'Tổng quan hệ thống',
  '/admin/products': 'Quản lý sản phẩm',
  '/admin/orders': 'Quản lý đơn hàng',
  '/admin/users': 'Quản lý tài khoản',
  '/admin/vouchers': 'Quản lý voucher',
  '/admin/reviews': 'Quản lý đánh giá',
};

const AdminLayout = () => {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Hệ thống quản trị';

  return (
    <div className="app-shell admin-layout">
      <div className="admin-body">
        <aside className="admin-sidebar">
          <Link to="/admin" className="admin-brand">
            Spa Admin
          </Link>

          <nav className="admin-nav">
            <NavLink to="/admin" end>
              Tổng quan
            </NavLink>

            <NavLink to="/admin/products">
              Sản phẩm
            </NavLink>

            <NavLink to="/admin/orders">
              Đơn hàng
            </NavLink>

            <NavLink to="/admin/users">
              Tài khoản
            </NavLink>

            <NavLink to="/admin/vouchers">
              Voucher
            </NavLink>

            <NavLink to="/admin/reviews">
              Đánh giá
            </NavLink>
          </nav>
        </aside>

        <div className="admin-content-wrapper">
          <header className="admin-topbar">
            <div className="admin-topbar-title">
              <span className="admin-eyebrow">SPA & SALON</span>
              <h1>{pageTitle}</h1>
            </div>

            <Link to="/" className="back-to-store">
              ← Về cửa hàng
            </Link>
          </header>

          <main className="admin-main">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLayout;