import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { AuthContext } from "../../../context/AuthContext";
import { authService } from "../../../services/authService";
import { validateLogin } from "../../../utils/validation";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    const result = await login(formData.email.trim(), formData.password);
    setSubmitting(false);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    const currentUser = authService.getCurrentUser();
    navigate(currentUser?.role === "Admin" ? "/admin" : "/");
  };

  return (
    <Container className="my-4" style={{ maxWidth: "420px" }}>
      <h2 className="mb-4 text-center">Đăng nhập</h2>

      {serverError && <Alert variant="danger">{serverError}</Alert>}

      <Form noValidate onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors.email}
            autoComplete="email"
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-4" controlId="password">
          <Form.Label>Mật khẩu</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
            isInvalid={!!errors.password}
            autoComplete="current-password"
          />
          <Form.Control.Feedback type="invalid">
            {errors.password}
          </Form.Control.Feedback>
        </Form.Group>

        <Button
          type="submit"
          variant="success"
          className="w-100"
          disabled={submitting}
        >
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </Form>

      <p className="text-center mt-3 mb-0">
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </Container>
  );
};

export default LoginPage;
