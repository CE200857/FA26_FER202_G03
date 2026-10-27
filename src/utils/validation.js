/**
 * Utility kiểm tra tính hợp lệ dữ liệu (Validation Utils)
 */

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