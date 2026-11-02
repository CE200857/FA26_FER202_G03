import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const Navigation = ({ layout = "horizontal" }) => {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  const customerLinks = [
    { to: "/products", label: "💄 Sản phẩm Spa & Mỹ phẩm", public: true },
    { to: "/vouchers", label: "🎟️ Mã giảm giá", authOnly: true },
    { to: "/orders/history", label: "📦 Lịch sử đơn hàng", authOnly: true },
  ];

  const adminLinks = [
    { to: "/admin", label: "📊 Bảng điều khiển (Dashboard)" },
    { to: "/admin/products", label: "🧴 Sản phẩm" },
    { to: "/admin/orders", label: "🧾 Đơn hàng" },
    { to: "/admin/users", label: "👥 Tài khoản" },
    { to: "/admin/vouchers", label: "🏷️ Voucher" },
    { to: "/admin/reviews", label: "⭐ Kiểm duyệt Đánh giá" },
    { to: "/products", label: "🛍️ Xem giao diện Cửa hàng" },
  ];

  const linksToRender = isAdmin
    ? adminLinks
    : customerLinks.filter(
        (link) => link.public || (link.authOnly && isAuthenticated),
      );

  const isSidebar = layout === "sidebar";

  return (
    <nav
      style={
        isSidebar
          ? {
              backgroundColor: "#2b2d42",
              minHeight: "100%",
              width: "250px",
              padding: "20px 12px",
              color: "#ffffff",
            }
          : {
              width: "100%",
              backgroundColor: "#355070",
              padding: "0 28px",
            }
      }
    >
      <div
        style={
          isSidebar
            ? {
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }
            : {
                width: "100%",
              }
        }
      >
        {isSidebar && (
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#8d99ae",
              padding: "0 12px 8px",
              borderBottom: "1px solid #3d405b",
              letterSpacing: "1px",
            }}
          >
            QUẢN TRỊ HỆ THỐNG
          </div>
        )}
        <ul
          style={
            isSidebar
              ? {
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }
              : {
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }
          }
        >
          {linksToRender.map((item) => (
            <li key={item.to} style={{ margin: 0 }}>
              <NavLink
                to={item.to}
                end={item.to === "/" || item.to === "/admin"}
                style={({ isActive }) => ({
                  display: "block",
                  padding: isSidebar ? "10px 14px" : "12px 16px",
                  color: isActive ? "#ffffff" : "#f8f9fa",
                  backgroundColor: isActive ? "#b56576" : "transparent",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "500",
                  borderRadius: "6px",
                  transition: "background-color 0.2s",
                })}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;