import React, { useState, useEffect } from 'react';
import { validateReview } from '../../../utils/validation';

const ReviewForm = ({ existingReview = null, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Gọi hàm kiểm tra hợp lệ từ src/utils/validation.js
    const { isValid, errors } = validateReview({ rating, comment });

    if (!isValid) {
      setError(errors.comment || errors.rating || 'Dữ liệu không hợp lệ.');
      return;
    }

    setError('');
    onSubmit({
      rating,
      comment: comment.trim(),
    });

    if (!existingReview) {
      setComment('');
      setRating(5);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
      </h3>

      {/* Chọn số sao */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá của bạn:</label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl focus:outline-none transition-colors"
            >
              <span className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600 font-medium">
            {hoverRating || rating} / 5 sao
          </span>
        </div>
      </div>

      {/* Ô nhập bình luận */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung nhận xét:</label>
        <textarea
          rows="3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          {existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;