import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ICONS = {
  bag: "M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm0 10c-2.21 0-4-1.79-4-4h2c0 1.1.9 2 2 2s2-.9 2-2h2c0 2.21-1.79 4-4 4z",
  tag: "M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z",
  receipt: "M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z",
  dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  people: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  store: "M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z",
};

const Icon = ({ path }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path d={path} />
  </svg>
);

const customerLinks = [
  { to: "/products", label: "Sản phẩm", icon: ICONS.bag, public: true },
  { to: "/vouchers", label: "Voucher", icon: ICONS.tag, authOnly: true },
  { to: "/orders/history", label: "Đơn hàng", icon: ICONS.receipt, authOnly: true },
];

const adminLinks = [
  { to: "/admin", label: "Tổng quan", icon: ICONS.dashboard },
  { to: "/admin/products", label: "Sản phẩm", icon: ICONS.bag },
  { to: "/admin/orders", label: "Đơn hàng", icon: ICONS.receipt },
  { to: "/admin/users", label: "Tài khoản", icon: ICONS.people },
  { to: "/admin/vouchers", label: "Voucher", icon: ICONS.tag },
  { to: "/admin/reviews", label: "Đánh giá", icon: ICONS.star },
  { to: "/products", label: "Cửa hàng", icon: ICONS.store },
];

export const Header = ({ onOpenCart, cartItemCount = 0 }) => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [hovered, setHovered] = useState("");
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = width <= 900;

  const hoverProps = (key) => ({
    onMouseEnter: () => setHovered(key),
    onMouseLeave: () => setHovered(""),
  });

  const linksToRender = isAdmin
    ? adminLinks
    : customerLinks.filter(
        (link) => link.public || (link.authOnly && isAuthenticated),
      );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        width: "100%",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #fbcfe8",
        padding: isMobile ? "8px 12px" : "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 18px rgba(225, 29, 116, 0.08)",
      }}
    >
      <div
        style={
          isMobile
            ? {
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }
            : {
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: "16px",
              }
        }
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
            justifySelf: "start",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "40px",
              borderRadius: "6px",
              background: "linear-gradient(180deg, #f472b6 0%, #e11d74 100%)",
            }}
          />
          <div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "19px",
                letterSpacing: "0.8px",
                color: "#e11d74",
                background: "linear-gradient(90deg, #be185d 0%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SEOUL CENTER
            </div>
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "1.5px",
                color: "#9d6b84",
              }}
            >
              Cosmetics Retail System
            </div>
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "6px",
            justifySelf: "center",
            ...(isMobile ? { flex: "0 0 100%", order: 3 } : {}),
          }}
        >
          {linksToRender.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              {...hoverProps(item.to)}
              style={({ isActive }) => ({
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                minWidth: isMobile ? "72px" : "92px",
                minHeight: isMobile ? "62px" : "78px",
                padding: "10px 14px",
                borderRadius: "0 0 16px 16px",
                color: isActive ? "#e11d74" : "#9d6b84",
                background: isActive
                  ? "linear-gradient(180deg, rgba(225, 29, 116, 0.16) 0%, rgba(225, 29, 116, 0) 90%)"
                  : hovered === item.to
                    ? "#fdf2f8"
                    : "transparent",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "700",
                whiteSpace: "nowrap",
                transition: "background 0.2s, color 0.2s",
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        width: "40px",
                        height: "4px",
                        transform: "translateX(-50%)",
                        borderRadius: "0 0 6px 6px",
                        backgroundColor: "#e11d74",
                        boxShadow: "0 4px 12px rgba(225, 29, 116, 0.5)",
                      }}
                    />
                  )}
                  <Icon path={item.icon} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            flexShrink: 0,
            justifySelf: "end",
          }}
        >
          {!isAdmin && (
            <button
              type="button"
              onClick={onOpenCart}
              title="Mở giỏ hàng"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 16px",
                borderRadius: "999px",
                border: "1px solid #fbcfe8",
                backgroundColor: "#fdf2f8",
                color: "#be185d",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🛒
              <span
                style={{
                  minWidth: "22px",
                  backgroundColor: "#e11d74",
                  color: "#ffffff",
                  borderRadius: "999px",
                  padding: "2px 7px",
                  fontSize: "12px",
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                {cartItemCount}
              </span>
            </button>
          )}

          {isAuthenticated ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Link
                to="/profile"
                title={user?.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                  color: "#3b2a35",
                }}
              >
                <span
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #f472b6 0%, #e11d74 100%)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    boxShadow: "0 4px 10px rgba(225, 29, 116, 0.3)",
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "9px 18px",
                  borderRadius: "999px",
                  border: "1px solid #e11d74",
                  backgroundColor: "#ffffff",
                  color: "#e11d74",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                to="/login"
                style={{
                  padding: "10px 22px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #f472b6 0%, #e11d74 100%)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: "700",
                  boxShadow: "0 6px 16px rgba(225, 29, 116, 0.3)",
                }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                style={{
                  padding: "9px 22px",
                  borderRadius: "10px",
                  border: "2px solid #e11d74",
                  backgroundColor: "#ffffff",
                  color: "#e11d74",
                  textDecoration: "none",
                  fontWeight: "700",
                }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;