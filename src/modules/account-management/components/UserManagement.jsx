import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";
import { AuthContext } from "../../../context/AuthContext";
import { userService } from "../../../services/userService";
import { validateUserForm } from "../../../utils/validation";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "Customer",
};

const UserManagement = () => {
  const { user, updateUser: updateAuthUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formMode, setFormMode] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const reloadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  const filteredUsers = users.filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setFormMode("create");
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
    setMessage("");
  };

  const handleEdit = (selectedUser) => {
    setFormMode("edit");
    setEditingId(selectedUser.id);
    setFormData({
      name: selectedUser.name,
      email: selectedUser.email,
      password: "",
      phone: selectedUser.phone || "",
      role: selectedUser.role,
    });
    setErrors({});
    setMessage("");
  };

  const handleCancel = () => {
    setFormMode("");
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEdit = formMode === "edit";
    const validationErrors = validateUserForm(formData, isEdit);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isEdit) {
        const updatedUser = await userService.updateUser(editingId, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
        });

        if (updatedUser.id === user.id) {
          updateAuthUser({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
          });
        }

        setMessage("Cập nhật tài khoản thành công.");
      } else {
        await userService.createUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          role: formData.role,
        });

        setMessage("Thêm tài khoản thành công.");
      }

      await reloadUsers();
      handleCancel();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleToggleStatus = async (selectedUser) => {
    const action = selectedUser.status === "active" ? "khóa" : "mở khóa";

    if (!window.confirm(`Bạn có muốn ${action} tài khoản này?`)) {
      return;
    }

    try {
      await userService.toggleUserStatus(selectedUser.id, user.id);
      await reloadUsers();
      setMessage(`Đã ${action} tài khoản thành công.`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      {message && <Alert variant="info">{message}</Alert>}

      <div className="d-flex flex-wrap gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="Tìm theo tên hoặc email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />

        <Form.Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Đã khóa</option>
        </Form.Select>
        <Button variant="success" onClick={handleAdd}>
          Thêm tài khoản
        </Button>
      </div>

      {formMode && (
        <Form
          noValidate
          onSubmit={handleSubmit}
          className="border rounded p-3 mb-4"
        >
          <h4>{formMode === "create" ? "Thêm tài khoản" : "Sửa tài khoản"}</h4>

          <Form.Group className="mb-3" controlId="userName">
            <Form.Label>Họ tên</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={formMode === "edit"}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          {formMode === "create" && (
            <Form.Group className="mb-3" controlId="userPassword">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="userPhone">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              isInvalid={!!errors.phone}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="userRole">
            <Form.Label>Vai trò</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={formMode === "edit" && editingId === user.id}
              isInvalid={!!errors.role}
            >
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.role}
            </Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" variant="success" className="me-2">
            Lưu
          </Button>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Hủy
          </Button>
        </Form>
      )}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center">
                Không tìm thấy tài khoản nào.
              </td>
            </tr>
          )}

          {filteredUsers.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>{item.phone || "-"}</td>
              <td>{item.role}</td>
              <td>{item.status === "active" ? "Hoạt động" : "Đã khóa"}</td>
              <td>
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="me-2 mb-1"
                  onClick={() => handleEdit(item)}
                >
                  Sửa
                </Button>

                {item.id !== user.id && (
                  <Button
                    size="sm"
                    variant={
                      item.status === "active"
                        ? "outline-danger"
                        : "outline-success"
                    }
                    className="mb-1"
                    onClick={() => handleToggleStatus(item)}
                  >
                    {item.status === "active" ? "Khóa" : "Mở khóa"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserManagement;
