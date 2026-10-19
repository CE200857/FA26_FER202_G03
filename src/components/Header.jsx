import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const Header = ({ onOpenCart, cartItemCount = 0 }) => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #eaeaea",
        padding: "12px 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#2c3e50",
          }}
        >
          <span style={{ fontSize: "28px" }}>✨</span>
          <div>
            <div
              style={{
                fontWeight: "700",
                fontSize: "18px",
                letterSpacing: "0.5px",
                color: "#b56576",
              }}
            >
              LUMIÈRE SPA & SALON
            </div>
            <div style={{ fontSize: "12px", color: "#6c757d" }}>
              Cosmetics Retail System
            </div>
          </div>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
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
                padding: "8px 14px",
                borderRadius: "20px",
                border: "1px solid #b56576",
                backgroundColor: "#fff5f7",
                color: "#b56576",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🛒 Giỏ hàng
              <span
                style={{
                  backgroundColor: "#b56576",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "2px 7px",
                  fontSize: "12px",
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                  color: "#333",
                }}
              >
                <span
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#b56576",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>
                    {user?.name}
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      color: "#fff",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      backgroundColor: isAdmin ? "#dc3545" : "#198754",
                    }}
                  >
                    {user?.role}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "7px 12px",
                  borderRadius: "6px",
                  border: "1px solid #dc3545",
                  backgroundColor: "transparent",
                  color: "#dc3545",
                  fontWeight: "500",
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
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #b56576",
                  color: "#b56576",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  backgroundColor: "#b56576",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: "600",
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
