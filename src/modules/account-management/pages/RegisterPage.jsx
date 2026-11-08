import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { AuthContext } from "../../../context/AuthContext";
import { validateRegister } from "../../../utils/validation";

const fields = [
  {
    name: "name",
    label: "Họ tên",
    type: "text",
    placeholder: "Nhập họ tên",
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Nhập email",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Mật khẩu",
    type: "password",
    placeholder: "Tối thiểu 6 ký tự",
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Xác nhận mật khẩu",
    type: "password",
    placeholder: "Nhập lại mật khẩu",
    autoComplete: "new-password",
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
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
    setSubmitting(false);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    navigate("/");
  };

  return (
    <Container className="my-4" style={{ maxWidth: "420px" }}>
      <h2 className="mb-4 text-center">Đăng ký tài khoản</h2>

      {serverError && <Alert variant="danger">{serverError}</Alert>}

      <Form noValidate onSubmit={handleSubmit}>
        {fields.map((field) => (
          <Form.Group key={field.name} className="mb-3" controlId={field.name}>
            <Form.Label>{field.label}</Form.Label>
            <Form.Control
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              isInvalid={!!errors[field.name]}
              autoComplete={field.autoComplete}
            />
            <Form.Control.Feedback type="invalid">
              {errors[field.name]}
            </Form.Control.Feedback>
          </Form.Group>
        ))}

        <Button
          type="submit"
          variant="success"
          className="w-100 mt-2"
          disabled={submitting}
        >
          {submitting ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </Form>

      <p className="text-center mt-3 mb-0">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </Container>
  );
};

export default RegisterPage;
