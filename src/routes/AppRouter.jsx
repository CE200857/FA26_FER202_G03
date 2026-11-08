// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import ProductCatalogPage from '../modules/product-management/pages/ProductCatalogPage';
import ProductDetailPage from '../modules/product-management/pages/ProductDetailPage';
import AdminDashboardPage from '../modules/product-management/pages/AdminDashboardPage';
import LoginPage from '../modules/account-management/pages/LoginPage';
import RegisterPage from '../modules/account-management/pages/RegisterPage';
import UserProfilePage from "../modules/account-management/pages/UserPageProfile";
import UpdateProfilePage from "../modules/account-management/pages/UpdateProfilePage";
import ChangePasswordPage from "../modules/account-management/pages/ChangePasswordPage";
import UserManagement from '../modules/account-management/components/UserManagement';
import VoucherManagementPage from '../modules/voucher-management/pages/VoucherManagementPage';
import MyVouchersPage from '../modules/voucher-management/pages/MyVouchersPage';
import ReviewModerationPage from '../modules/review-management/components/ReviewModeration';
import ProductReviewPage from '../modules/review-management/pages/ProductReviewPage';
import OrderHistoryPage from '../modules/cart-order/pages/OrderHistoryPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* GIAO DIỆN KHÁCH HÀNG */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<ProductCatalogPage />} />
        <Route path="/products" element={<ProductCatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* ĐƯỜNG DẪN ĐÁNH GIÁ CHUẨN CỦA DỰ ÁN */}
        <Route path="/reviews" element={<ProductReviewPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* CÁC TRANG CẦN ĐĂNG NHẬP */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/profile/update" element={<UpdateProfilePage />} />
          <Route path="/profile/change-password" element={<ChangePasswordPage />} />
          <Route path="/orders/history" element={<OrderHistoryPage />} />
          <Route path="/vouchers" element={<MyVouchersPage />} />
        </Route>
      </Route>

      {/* GIAO DIỆN ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="vouchers" element={<VoucherManagementPage />} />
          <Route path="reviews" element={<ReviewModerationPage />} />
        </Route>
      </Route>

      {/* FALLBACK KHÔNG TÌM THẤY TRANG */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;