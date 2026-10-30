// src/modules/review-management/components/ReviewForm.jsx
import React, { useState } from 'react';
import { reviewService } from '../../../services/reviewService';
import { validateReview } from '../../../utils/validation';

const ReviewForm = ({ productId, currentUser, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Kiểm tra tính hợp lệ dữ liệu
    const validationResult = validateReview
      ? validateReview({ rating, comment })
      : { isValid: comment.trim().length >= 5, errors: { comment: 'Nhận xét phải có ít nhất 5 ký tự.' } };

    if (!validationResult.isValid) {
      setError(validationResult.errors.comment || validationResult.errors.rating || 'Dữ liệu không hợp lệ.');
      return;
    }

    try {
      setLoading(true);
      const createFn = reviewService?.createReview || reviewService?.addReview;

      if (typeof createFn === 'function') {
        await createFn({
          productId,
          userId: currentUser?.id,
          userName: currentUser?.name || currentUser?.userName || 'Khách hàng',
          rating,
          comment: comment.trim(),
        });
      }

      setComment('');
      setRating(5);
      alert('Đánh giá của bạn đã được gửi thành công!');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form border p-4 rounded-lg bg-white shadow-sm mt-4">
      <h4 className="font-bold text-lg mb-3 text-gray-800">Viết đánh giá của bạn</h4>

      {error && <div className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Số sao:</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border rounded p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[5, 4, 3, 2, 1].map((num) => (
              <option key={num} value={num}>
                {num} Sao
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung nhận xét:</label>
          <textarea
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Nhập nhận xét của bạn (ít nhất 5 ký tự)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;