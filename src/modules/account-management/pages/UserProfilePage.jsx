import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { userService } from "../../../services/userService";
import {
  validateProfile,
  validateChangePassword,
} from "../../../utils/validation";

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

const buttonStyle = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#b56576",
  color: "#ffffff",
  fontWeight: "600",
  cursor: "pointer",
};

const Message = ({ type, text }) => (
  <div
    style={{
      padding: "10px 12px",
      marginBottom: "16px",
      borderRadius: "6px",
      fontSize: "14px",
      backgroundColor: type === "success" ? "#d1e7dd" : "#f8d7da",
      color: type === "success" ? "#0f5132" : "#842029",
    }}
  >
    {text}
  </div>
);

const UserProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(() => {
    const found = user ? userService.getUserById(user.id) : null;
    return { name: found?.name || "", phone: found?.phone || "" };
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState(null);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState(null);

  if (!user) {
    return (
      <section style={{ ...cardStyle, textAlign: "center" }}>
        <p>Vui lòng đăng nhập để xem hồ sơ cá nhân.</p>
        <Link to="/login" style={{ color: "#b56576", fontWeight: "600" }}>
          Đến trang đăng nhập
        </Link>
      </section>
    );
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    setProfileErrors({ ...profileErrors, [name]: "" });
    setProfileMessage(null);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateProfile(profileData);
    if (Object.keys(validationErrors).length > 0) {
      setProfileErrors(validationErrors);
      return;
    }

    try {
      const updated = userService.updateProfile(user.id, {
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
      });
      updateUser(updated);
      setProfileMessage({
        type: "success",
        text: "Cập nhật hồ sơ thành công!",
      });
    } catch (error) {
      setProfileMessage({ type: "error", text: error.message });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    setPasswordErrors({ ...passwordErrors, [name]: "" });
    setPasswordMessage(null);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateChangePassword(passwordData);
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    try {
      userService.changePassword(
        user.id,
        passwordData.oldPassword,
        passwordData.newPassword,
      );
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage({
        type: "success",
        text: "Đổi mật khẩu thành công!",
      });
    } catch (error) {
      setPasswordMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div style={{ maxWidth: "560px", margin: "32px auto" }}>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, color: "#b56576" }}>Hồ sơ cá nhân</h2>

        {profileMessage && (
          <Message type={profileMessage.type} text={profileMessage.text} />
        )}

        <form onSubmit={handleProfileSubmit} noValidate>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              style={{ ...inputStyle(false), backgroundColor: "#f1f1f1" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px" }}>
              Vai trò
            </label>
            <input
              type="text"
              value={user.role}
              disabled
              style={{ ...inputStyle(false), backgroundColor: "#f1f1f1" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="profile-name"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Họ tên
            </label>
            <input
              id="profile-name"
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              style={inputStyle(profileErrors.name)}
            />
            {profileErrors.name && (
              <small style={{ color: "#dc3545" }}>{profileErrors.name}</small>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="profile-phone"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Số điện thoại
            </label>
            <input
              id="profile-phone"
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              placeholder="VD: 0901234567"
              style={inputStyle(profileErrors.phone)}
            />
            {profileErrors.phone && (
              <small style={{ color: "#dc3545" }}>{profileErrors.phone}</small>
            )}
          </div>

          <button type="submit" style={buttonStyle}>
            Lưu thay đổi
          </button>
        </form>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, color: "#b56576" }}>Đổi mật khẩu</h2>

        {passwordMessage && (
          <Message type={passwordMessage.type} text={passwordMessage.text} />
        )}

        <form onSubmit={handlePasswordSubmit} noValidate>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="oldPassword"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Mật khẩu hiện tại
            </label>
            <input
              id="oldPassword"
              type="password"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              style={inputStyle(passwordErrors.oldPassword)}
            />
            {passwordErrors.oldPassword && (
              <small style={{ color: "#dc3545" }}>
                {passwordErrors.oldPassword}
              </small>
            )}
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="newPassword"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Tối thiểu 6 ký tự"
              style={inputStyle(passwordErrors.newPassword)}
            />
            {passwordErrors.newPassword && (
              <small style={{ color: "#dc3545" }}>
                {passwordErrors.newPassword}
              </small>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="confirmPassword"
              style={{ display: "block", marginBottom: "6px" }}
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              style={inputStyle(passwordErrors.confirmPassword)}
            />
            {passwordErrors.confirmPassword && (
              <small style={{ color: "#dc3545" }}>
                {passwordErrors.confirmPassword}
              </small>
            )}
          </div>

          <button type="submit" style={buttonStyle}>
            Đổi mật khẩu
          </button>
        </form>
      </section>
    </div>
  );
};

export default UserProfilePage;