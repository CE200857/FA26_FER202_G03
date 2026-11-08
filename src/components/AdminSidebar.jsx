import React from "react";
import { NavLink } from "react-router-dom";

const AdminSideBar = () => {
  return (
    <aside className="bg-success text-white p-3 col-12 col-md-3 col-lg-2">
      <h5 className="mb-3">Quản trị</h5>

      <nav className="d-flex flex-column gap-2">
        <NavLink to="/admin" end className="btn btn-outline-light text-start">
          Tổng quan
        </NavLink>

        <NavLink
          to="/admin/products"
          className="btn btn-outline-light text-start"
        >
          Sản phẩm
        </NavLink>

        <NavLink
          to="/admin/orders"
          className="btn btn-outline-light text-start"
        >
          Đơn hàng
        </NavLink>

        <NavLink to="/admin/users" className="btn btn-outline-light text-start">
          Tài khoản
        </NavLink>

        <NavLink
          to="/admin/vouchers"
          className="btn btn-outline-light text-start"
        >
          Voucher
        </NavLink>

        <NavLink
          to="/admin/reviews"
          className="btn btn-outline-light text-start"
        >
          Đánh giá
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSideBar;