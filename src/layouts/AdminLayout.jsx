import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdminSidebar from "../components/AdminSidebar";

const pageTitles = {
  "/admin": "Tổng quan hệ thống",
  "/admin/products": "Quản lý sản phẩm",
  "/admin/orders": "Quản lý đơn hàng",
  "/admin/users": "Quản lý tài khoản",
  "/admin/vouchers": "Quản lý voucher",
  "/admin/reviews": "Quản lý đánh giá",
};

const AdminLayout = () => {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Hệ thống quản trị";

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="d-flex flex-column flex-md-row flex-grow-1">
        <AdminSidebar />
        <main className="flex-grow-1 p-3 overflow-auto">
          <h2 className="mb-4">{pageTitle}</h2>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
