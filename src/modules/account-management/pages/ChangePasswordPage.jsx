import React, { useState, useContext } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { userService } from "../../../services/userService";
import { validateChangePassword } from "../../../utils/validation";

const ChangePasswordPage = () => {
  const { user } = useContext(AuthContext);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submit, setSubmit] = useState(false);

  const passwordErrors = validateChangePassword({
    oldPassword, newPassword, confirmPassword
  });

  const validOldPassword = !passwordErrors.oldPassword;
  const validNewPassword = !passwordErrors.newPassword;
  const validConfirmPassword = !passwordErrors.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmit(true);

    if (validOldPassword && validNewPassword && validConfirmPassword) {
      try {
        await userService.changePassword(user.id, oldPassword, newPassword);

        alert("Đổi mật khẩu thành công!");

        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSubmit(false);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleReset = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSubmit(false);
  };

  if (!user) {
    return (
      <Container className="my-4">
        <h2>Vui lòng đăng nhập để đổi mật khẩu.</h2>
        <Button as={Link} to="/login" variant="success">
          Đăng nhập
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-4" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4">Đổi mật khẩu</h2>
      <Form noValidate onSubmit={handleSubmit} onReset={handleReset}>
        <Form.Group className="mb-3" controlId="oldPassword">
          <Form.Label>Mật khẩu hiện tại</Form.Label>
          <Form.Control
            type="password"
            placeholder="Nhập mật khẩu hiện tại"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            isInvalid={submit && !validOldPassword}
            autoComplete="current-password"
          />
          <Form.Control.Feedback type="invalid">
            {passwordErrors.oldPassword}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>Mật khẩu mới</Form.Label>
          <Form.Control
            type="password"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            isInvalid={submit && !validNewPassword}
            isValid={submit && validNewPassword}
            autoComplete="new-password"
          />
          <Form.Control.Feedback type="invalid">
            {passwordErrors.newPassword}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Xác nhận mật khẩu mới</Form.Label>
          <Form.Control
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            isInvalid={submit && !validConfirmPassword}
            isValid={submit && validConfirmPassword}
            autoComplete="new-password"
          />
          <Form.Control.Feedback type="invalid">
            {passwordErrors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>
        <div className="d-flex flex-wrap gap-2">
          <Button type="submit" variant="success">
            Đổi mật khẩu
          </Button>
          <Button type="reset" variant="secondary">
            Đặt lại
          </Button>
          <Button as={Link} to="/profile" variant="outline-secondary">
            Về hồ sơ
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default ChangePasswordPage;
