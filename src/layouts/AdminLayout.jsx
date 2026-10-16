import { Outlet, NavLink, Link } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="app-shell admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-brand">Spa Admin</h2>
        <nav className="admin-nav">
          <NavLink to="/admin" end>Tổng quan (Dashboard)</NavLink>
          <NavLink to="/admin/products">Quản lý Sản phẩm</NavLink>
          <NavLink to="/admin/orders">Quản lý Đơn hàng</NavLink>
          <NavLink to="/admin/users">Quản lý Tài khoản</NavLink>
          <NavLink to="/admin/vouchers">Quản lý Voucher</NavLink>
          <NavLink to="/admin/reviews">Quản lý Đánh giá</NavLink>
          <hr />
          <Link to="/">← Về trang Cửa hàng</Link>
        </nav>
      </aside>

      <div className="admin-content-wrapper">
        <header className="admin-topbar">
          <span>Hệ thống Quản trị Bán lẻ Mỹ phẩm Spa/Salon</span>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;