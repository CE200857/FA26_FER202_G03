import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import VoucherManagementPage from '../modules/voucher-management/pages/VoucherManagementPage';
import MyVouchersPage from '../modules/voucher-management/pages/MyVouchersPage';

const PlaceholderPage = ({ title }) => (
  <section style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
    <h2>{title}</h2>
    <p>Trang thuộc khung định tuyến Tuần 1 (Group 3).</p>
  </section>
);

const AppRouter = () => {
  return (
    <Routes>
      {/* Cụm Route dành cho Khách hàng */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<PlaceholderPage title="Danh mục Mỹ phẩm Spa & Salon (Product Catalog)" />} />
        <Route path="/products" element={<PlaceholderPage title="Danh sách Sản phẩm" />} />
        <Route path="/products/:id" element={<PlaceholderPage title="Chi tiết Sản phẩm" />} />
        <Route path="/login" element={<PlaceholderPage title="Đăng nhập" />} />
        <Route path="/register" element={<PlaceholderPage title="Đăng ký" />} />
        <Route path="/checkout" element={<PlaceholderPage title="Thanh toán Đơn hàng (Checkout)" />} />
        <Route path="/orders/history" element={<PlaceholderPage title="Lịch sử Mua hàng (Order History)" />} />
        <Route path="/profile" element={<PlaceholderPage title="Hồ sơ Cá nhân" />} />
        <Route path="/vouchers" element={<MyVouchersPage />} />
      </Route>

      {/* Cụm Route dành cho Admin / Manager */}

      <Route path="/admin" element={<AdminLayout />}>
        <Route
          index
          element={<PlaceholderPage title="Tổng quan hệ thống" />}
        />
        <Route
          path="products"
          element={<PlaceholderPage title="Quản lý sản phẩm" />}
        />
        <Route
          path="orders"
          element={<PlaceholderPage title="Quản lý đơn hàng" />}
        />
        <Route
          path="users"
          element={<PlaceholderPage title="Quản lý tài khoản" />}
        />
        <Route
          path="vouchers"
          element={<VoucherManagementPage />}
        />
        <Route
          path="reviews"
          element={<PlaceholderPage title="Quản lý đánh giá" />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;