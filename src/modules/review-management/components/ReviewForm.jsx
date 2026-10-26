// src/modules/review-management/components/ReviewForm.jsx
import React, { useState } from 'react';
import { reviewService } from '../../../services/reviewService';

const ReviewForm = ({ productId, currentUser, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation cơ bản
    if (comment.trim().length < 10) {
      setError('Nhận xét phải có ít nhất 10 ký tự.');
      return;
    }

    try {
      setLoading(true);
      await reviewService.createReview({
        productId,
        userId: currentUser.id,
        userName: currentUser.name,
        rating,
        comment
      });
      
      setComment('');
      setRating(5);
      alert('Đánh giá của bạn đã được gửi và đang chờ duyệt!');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form border p-4 rounded mt-4">
      <h4 className="font-bold mb-2">Viết đánh giá của bạn</h4>
      
      {error && <div className="text-red-500 mb-2">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="mr-2">Số sao:</label>
          <select 
            value={rating} 
            onChange={(e) => setRating(Number(e.target.value))}
            className="border rounded p-1"
          >
            {[5, 4, 3, 2, 1].map(num => (
              <option key={num} value={num}>{num} Sao</option>
            ))}
          </select>
        </div>
        
        <div className="mb-2">
          <textarea
            className="w-full border rounded p-2"
            rows="3"
            placeholder="Nhập nhận xét của bạn (ít nhất 10 ký tự)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;