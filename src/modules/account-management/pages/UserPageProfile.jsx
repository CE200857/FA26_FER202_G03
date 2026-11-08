import React, { useContext, useEffect, useState } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { AuthContext } from "../../../context/AuthContext";
import { userService } from "../../../services/userService";

const UserProfilePage = () => {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    userService
      .getUserById(user.id)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((error) => {
        alert(error.message);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <Container className="my-4">
        <p>Đang tải...</p>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="my-4">
        <h2>Không tìm thấy thông tin tài khoản.</h2>
        <Button as={Link} to="/login" variant="success">
          Đăng nhập
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-4" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4">Hồ sơ cá nhân</h2>
      <Card>
        <Card.Body>
          <Card.Text className="text-break">
            <strong>Họ và Tên:</strong> {profile.name}
          </Card.Text>
          <Card.Text className="text-break">
            <strong>Email:</strong> {profile.email}
          </Card.Text>
          <Card.Text>
            <strong>Số điện thoại:</strong> {profile.phone}
          </Card.Text>
          <Card.Text>
            <strong>Vai trò:</strong>{" "}
            {profile.role === "Admin" ? "Quản trị viên" : "Khách hàng"}
          </Card.Text>
          <div className="d-flex flex-wrap gap-2 mt-4">
            <Button as={Link} to="/profile/update" variant="success">
              Cập nhật hồ sơ
            </Button>
            <Button as={Link} to="/profile/change-password" variant="secondary">
              Đổi mật khẩu
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserProfilePage;
