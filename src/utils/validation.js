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

/**
 * Validate dữ liệu form đánh giá (Review)
 * @param {Object} data - { rating, comment }
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateReview = ({ rating, comment }) => {
  const errors = {};

  // Kiểm tra số sao (rating)
  if (!rating || typeof rating !== 'number') {
    errors.rating = 'Vui lòng chọn số sao đánh giá.';
  } else if (rating < 1 || rating > 5) {
    errors.rating = 'Số sao đánh giá phải từ 1 đến 5 sao.';
  }

  // Kiểm tra nội dung nhận xét (comment)
  if (!comment || !comment.trim()) {
    errors.comment = 'Vui lòng nhập nội dung đánh giá.';
  } else if (comment.trim().length < 5) {
    errors.comment = 'Nội dung đánh giá phải có ít nhất 5 ký tự.';
  } else if (comment.trim().length > 1000) {
    errors.comment = 'Nội dung đánh giá không được vượt quá 1000 ký tự.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Kiểm tra chuỗi/giá trị không được để trống
 */
export const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};