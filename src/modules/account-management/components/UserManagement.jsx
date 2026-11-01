import { useState, useContext } from "react";
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

const cardStyle = {
  background: "#ffffff",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  marginBottom: "24px",
};

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: hasError ? "1px solid #dc3545" : "1px solid #ccc",
  boxSizing: "border-box",
});

const primaryButton = {
  padding: "10px 18px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#b56576",
  color: "#ffffff",
  fontWeight: "600",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "10px 18px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  backgroundColor: "#ffffff",
  color: "#333333",
  cursor: "pointer",
};

const smallButton = (color) => ({
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: color,
  color: "#ffffff",
  fontSize: "13px",
  cursor: "pointer",
  marginRight: "6px",
});

const cellStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  textAlign: "left",
  fontSize: "14px",
};

const UserManagement = () => {
  const { user, updateUser: updateAuthUser } = useContext(AuthContext);

  const [users, setUsers] = useState(() => userService.getAllUsers());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formMode, setFormMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  const reloadUsers = () => setUsers(userService.getAllUsers());

  const filteredUsers = users.filter((u) => {
    const keyword = searchTerm.trim().toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(keyword) ||
      u.email.toLowerCase().includes(keyword);
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setFormMode("create");
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
    setMessage(null);
  };

  const handleOpenEdit = (target) => {
    setFormMode("edit");
    setEditingId(target.id);
    setFormData({
      name: target.name,
      email: target.email,
      password: "",
      phone: target.phone || "",
      role: target.role,
    });
    setErrors({});
    setMessage(null);
  };

  const handleCloseForm = () => {
    setFormMode(null);
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isEdit = formMode === "edit";
    const validationErrors = validateUserForm(formData, isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isEdit) {
        const updated = userService.updateUser(editingId, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
        });
        if (updated.id === user.id) {
          updateAuthUser({
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
          });
        }
        setMessage({ type: "success", text: "Cập nhật tài khoản thành công!" });
      } else {
        userService.createUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          role: formData.role,
        });
        setMessage({ type: "success", text: "Thêm tài khoản thành công!" });
      }
      reloadUsers();
      handleCloseForm();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const handleToggleStatus = (target) => {
    const isLocking = target.status === "active";
    const confirmed = window.confirm(
      isLocking
        ? `Bạn có chắc muốn khóa tài khoản "${target.name}"?`
        : `Bạn có chắc muốn mở khóa tài khoản "${target.name}"?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      userService.toggleUserStatus(target.id, user.id);
      reloadUsers();
      setMessage({
        type: "success",
        text: isLocking
          ? "Đã khóa tài khoản thành công!"
          : "Đã mở khóa tài khoản thành công!",
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div>
      {message && (
        <div
          style={{
            padding: "10px 12px",
            marginBottom: "16px",
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: message.type === "success" ? "#d1e7dd" : "#f8d7da",
            color: message.type === "success" ? "#0f5132" : "#842029",
          }}
        >
          {message.text}
        </div>
      )}

      {formMode && (
        <section style={cardStyle}>
          <h3 style={{ marginTop: 0, color: "#b56576" }}>
            {formMode === "edit" ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
          </h3>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="um-name"
                style={{ display: "block", marginBottom: "6px" }}
              >
                Họ tên
              </label>
              <input
                id="um-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle(errors.name)}
              />
              {errors.name && (
                <small style={{ color: "#dc3545" }}>{errors.name}</small>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="um-email"
                style={{ display: "block", marginBottom: "6px" }}
              >
                Email
              </label>
              <input
                id="um-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={formMode === "edit"}
                style={{
                  ...inputStyle(errors.email),
                  backgroundColor: formMode === "edit" ? "#f1f1f1" : "#ffffff",
                }}
              />
              {errors.email && (
                <small style={{ color: "#dc3545" }}>{errors.email}</small>
              )}
            </div>

            {formMode === "create" && (
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="um-password"
                  style={{ display: "block", marginBottom: "6px" }}
                >
                  Mật khẩu
                </label>
                <input
                  id="um-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự"
                  style={inputStyle(errors.password)}
                />
                {errors.password && (
                  <small style={{ color: "#dc3545" }}>{errors.password}</small>
                )}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="um-phone"
                style={{ display: "block", marginBottom: "6px" }}
              >
                Số điện thoại
              </label>
              <input
                id="um-phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="VD: 0901234567"
                style={inputStyle(errors.phone)}
              />
              {errors.phone && (
                <small style={{ color: "#dc3545" }}>{errors.phone}</small>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="um-role"
                style={{ display: "block", marginBottom: "6px" }}
              >
                Vai trò
              </label>
              <select
                id="um-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={formMode === "edit" && editingId === user.id}
                style={inputStyle(errors.role)}
              >
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.role && (
                <small style={{ color: "#dc3545" }}>{errors.role}</small>
              )}
            </div>

            <button type="submit" style={{ ...primaryButton, marginRight: "10px" }}>
              {formMode === "edit" ? "Lưu thay đổi" : "Thêm tài khoản"}
            </button>
            <button type="button" onClick={handleCloseForm} style={secondaryButton}>
              Hủy
            </button>
          </form>
        </section>
      )}

      <section style={cardStyle}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên hoặc email"
            style={{ ...inputStyle(false), flex: "1 1 220px", width: "auto" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...inputStyle(false), width: "auto" }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã khóa</option>
          </select>
          <button type="button" onClick={handleOpenCreate} style={primaryButton}>
            + Thêm tài khoản
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Họ tên</th>
                <th style={cellStyle}>Email</th>
                <th style={cellStyle}>Số điện thoại</th>
                <th style={cellStyle}>Vai trò</th>
                <th style={cellStyle}>Trạng thái</th>
                <th style={cellStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ ...cellStyle, textAlign: "center", color: "#777" }}
                  >
                    Không tìm thấy tài khoản nào.
                  </td>
                </tr>
              )}
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={cellStyle}>{u.id}</td>
                  <td style={cellStyle}>{u.name}</td>
                  <td style={cellStyle}>{u.email}</td>
                  <td style={cellStyle}>{u.phone || "—"}</td>
                  <td style={cellStyle}>{u.role}</td>
                  <td style={cellStyle}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor:
                          u.status === "active" ? "#d1e7dd" : "#f8d7da",
                        color: u.status === "active" ? "#0f5132" : "#842029",
                      }}
                    >
                      {u.status === "active" ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(u)}
                      style={smallButton("#355070")}
                    >
                      Sửa
                    </button>
                    {u.id !== user.id && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        style={smallButton(
                          u.status === "active" ? "#dc3545" : "#198754",
                        )}
                      >
                        {u.status === "active" ? "Khóa" : "Mở khóa"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UserManagement;