import React, { useState, useContext, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { userService } from "../../../services/userService";

const UpdateProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    userService
      .getUserById(user.id)
      .then((data) => {
        setProfile(data);
        if (data) {
          setName(data.name);
          setPhone(data.phone);
        }
        setLoading(false);
      })
      .catch((error) => {
        alert(error.message);
        setLoading(false);
      });
  }, [user]);

  const validName = name.trim() !== "";
  const validPhone = phone.trim() === "" || /^0\d{9}$/.test(phone.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmit(true);

    if (validName && validPhone) {
      try {
        const updatedUser = await userService.updateProfile(user.id, {
          name: name.trim(),
          phone: phone.trim(),
        });

        updateUser(updatedUser);

        setName(name.trim());
        setPhone(phone.trim());
        setSubmit(false);

        alert("Cập nhật hồ sơ thành công!");
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleReset = () => {
    setName(String(profile.name || ""));
    setPhone(String(profile.phone || ""));
    setSubmit(false);
  };

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
      <h2 className="mb-4">Cập nhật hồ sơ</h2>
      <Form noValidate onSubmit={handleSubmit} onReset={handleReset}>
        <Form.Group className="mb-3" controlId="profileEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={profile.email} disabled />
        </Form.Group>
        <Form.Group className="mb-3" controlId="profileName">
          <Form.Label>Họ và Tên</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập họ tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            isInvalid={submit && !validName}
            isValid={submit && validName}
          />
          <Form.Control.Feedback type="invalid">
            Vui lòng nhập họ tên.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="profilePhone">
          <Form.Label>Số điện thoại</Form.Label>
          <Form.Control
            type="tel"
            placeholder="VD: 0901234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            isInvalid={submit && !validPhone}
            isValid={submit && validPhone && phone.trim() !== ""}
            autoComplete="tel"
          />
          <Form.Control.Feedback type="invalid">
            Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.
          </Form.Control.Feedback>
        </Form.Group>

        <div className="d-flex flex-wrap gap-2">
          <Button type="submit" variant="success">
            Lưu thay đổi
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

export default UpdateProfilePage;
