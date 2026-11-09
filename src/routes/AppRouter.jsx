// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import ProductCatalogPage from '../modules/product-management/pages/ProductCatalogPage';
import ProductDetailPage from '../modules/product-management/pages/ProductDetailPage';
import AdminDashboardPage from '../modules/product-management/pages/AdminDashboardPage';
import ProductManagementPage from '../modules/product-management/pages/ProductManagementPage';
import LoginPage from '../modules/account-management/pages/LoginPage';
import RegisterPage from '../modules/account-management/pages/RegisterPage';
import UserProfilePage from "../modules/account-management/pages/UserPageProfile";
import UpdateProfilePage from "../modules/account-management/pages/UpdateProfilePage";
import ChangePasswordPage from "../modules/account-management/pages/ChangePasswordPage";
import UserManagement from '../modules/account-management/components/UserManagement';
import VoucherManagementPage from '../modules/voucher-management/pages/VoucherManagementPage';
import MyVouchersPage from '../modules/voucher-management/pages/MyVouchersPage';
import ReviewManagementPage from '../modules/review-management/pages/ReviewManagementPage';
import ProductReviewPage from '../modules/review-management/pages/ProductReviewPage';
import OrderHistoryPage from '../modules/cart-order/pages/OrderHistoryPage';
import CheckoutPage from '../modules/cart-order/pages/CheckoutPage';
import OrderManagement from '../modules/cart-order/components/OrderManagement';
const PlaceholderPage = ({ title }) => (
    <section style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
        <h2>{title}</h2>
        <p>Chức năng này sẽ hoàn thiện ở tuần sau.</p>
    </section>
);

const AppRouter = () => {
    const { isAdmin } = useContext(AuthContext);

    return (
        <Routes>
            <Route element={<CustomerLayout />}>
                <Route path="/" element={<ProductCatalogPage />} />
                <Route path="/products" element={<ProductCatalogPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders/history" element={<OrderHistoryPage />} />
                    <Route path="/vouchers" element={<MyVouchersPage />} />
                    <Route path="/reviews" element={<ProductReviewPage />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={isAdmin ? <AdminLayout /> : <CustomerLayout />}>
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/profile/update" element={<UpdateProfilePage />} />
                    <Route path="/profile/change-password" element={<ChangePasswordPage />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="vouchers" element={<VoucherManagementPage />} />
                    <Route path="reviews" element={<ReviewManagementPage />} />
                    <Route path="products" element={<ProductManagementPage />}/>
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;