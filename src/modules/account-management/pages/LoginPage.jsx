import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { authService } from "../../../services/authService";
import { validateLogin } from "../../../utils/validation";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateLogin(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await login(formData.email.trim(), formData.password);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    const currentUser = authService.getCurrentUser();
    navigate(currentUser?.role === "Admin" ? "/admin" : "/");
  };

  return (
    <section
      style={{
        maxWidth: "420px",
        margin: "40px auto",
        padding: "28px",
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#b56576", textAlign: "center" }}>
        Đăng nhập
      </h2>

      {serverError && (
        <div
          style={{
            padding: "10px 12px",
            marginBottom: "16px",
            borderRadius: "6px",
            backgroundColor: "#f8d7da",
            color: "#842029",
            fontSize: "14px",
          }}
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "6px" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: errors.email ? "1px solid #dc3545" : "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          {errors.email && (
            <small style={{ color: "#dc3545" }}>{errors.email}</small>
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "6px" }}>
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: errors.password ? "1px solid #dc3545" : "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          {errors.password && (
            <small style={{ color: "#dc3545" }}>{errors.password}</small>
          )}
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#b56576",
            color: "#ffffff",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Đăng nhập
        </button>
      </form>

      <p style={{ textAlign: "center", marginBottom: 0, marginTop: "16px" }}>
        Chưa có tài khoản?{" "}
        <Link to="/register" style={{ color: "#b56576", fontWeight: "600" }}>
          Đăng ký
        </Link>
      </p>
    </section>
  );
};

export default LoginPage;