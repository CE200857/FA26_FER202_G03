import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { validateRegister } from "../../../utils/validation";

const fields = [
  { name: "name", label: "Họ tên", type: "text", placeholder: "Nhập họ tên" },
  { name: "email", label: "Email", type: "email", placeholder: "Nhập email" },
  {
    name: "password",
    label: "Mật khẩu",
    type: "password",
    placeholder: "Tối thiểu 6 ký tự",
  },
  {
    name: "confirmPassword",
    label: "Xác nhận mật khẩu",
    type: "password",
    placeholder: "Nhập lại mật khẩu",
  },
];

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    const validationErrors = validateRegister(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    navigate("/");
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
        Đăng ký tài khoản
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
        {fields.map((field) => (
          <div key={field.name} style={{ marginBottom: "16px" }}>
            <label
              htmlFor={field.name}
              style={{ display: "block", marginBottom: "6px" }}
            >
              {field.label}
            </label>
            <input
              id={field.name}
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: errors[field.name]
                  ? "1px solid #dc3545"
                  : "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
            {errors[field.name] && (
              <small style={{ color: "#dc3545" }}>{errors[field.name]}</small>
            )}
          </div>
        ))}

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
          Đăng ký
        </button>
      </form>

      <p style={{ textAlign: "center", marginBottom: 0, marginTop: "16px" }}>
        Đã có tài khoản?{" "}
        <Link to="/login" style={{ color: "#b56576", fontWeight: "600" }}>
          Đăng nhập
        </Link>
      </p>
    </section>
  );
};

export default RegisterPage;