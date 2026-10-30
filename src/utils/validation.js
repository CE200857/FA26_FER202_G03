const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9}$/;

export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Email không hợp lệ";
  }

  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu";
  }

  return errors;
};

export const validateRegister = ({ name, email, password, confirmPassword }) => {
  const errors = {};

  if (!name.trim()) {
    errors.name = "Vui lòng nhập họ tên";
  }

  if (!email.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Email không hợp lệ";
  }

  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  return errors;
};

export const validateProfile = ({ name, phone }) => {
  const errors = {};

  if (!name.trim()) {
    errors.name = "Vui lòng nhập họ tên";
  }

  if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
    errors.phone = "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0";
  }

  return errors;
};

export const validateChangePassword = ({
  oldPassword,
  newPassword,
  confirmPassword,
}) => {
  const errors = {};

  if (!oldPassword) {
    errors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
  }

  if (!newPassword) {
    errors.newPassword = "Vui lòng nhập mật khẩu mới";
  } else if (newPassword.length < 6) {
    errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
  } else if (newPassword === oldPassword) {
    errors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
  } else if (confirmPassword !== newPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  return errors;
};