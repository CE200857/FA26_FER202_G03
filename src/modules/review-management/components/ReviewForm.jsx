// src/modules/review-management/components/ReviewForm.jsx
import React, { useState } from 'react';

const ReviewForm = ({ onSubmit, initialData = null, onCancel = null }) => {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      setError('Nội dung nhận xét phải ít nhất 5 ký tự.');
      return;
    }
    setError('');
    onSubmit({ rating, comment });
    if (!initialData) setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-light p-4 rounded-3 border mb-4">
      <h5 className="fw-bold mb-3 text-dark">
        {initialData ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
      </h5>

      <div className="mb-3">
        <label className="form-label d-block text-secondary small fw-bold">
          Đánh giá của bạn:
        </label>
        <div className="d-flex align-items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{ cursor: 'pointer', fontSize: '1.75rem', transition: 'transform 0.1s' }}
              className={`lh-1 ${
                (hoverRating || rating) >= star ? 'text-warning' : 'text-secondary opacity-25'
              }`}
            >
              ★
            </span>
          ))}
          <span className="ms-2 fw-bold text-dark fs-6">
            {hoverRating || rating} / 5 sao
          </span>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label text-secondary small fw-bold">
          Nội dung nhận xét:
        </label>
        <textarea
          rows="3"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold">
          {initialData ? 'Cập nhật' : 'Gửi đánh giá'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline-secondary px-4 rounded-pill">
            Hủy
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;