// src/modules/review-management/components/ReviewItem.jsx
import React from 'react';
import { reviewService } from '../../../services/reviewService';

const ReviewItem = ({ review, currentUser, onReviewChanged }) => {
  const isOwner = currentUser && currentUser.id === review.userId;

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        await reviewService.deleteReview(review.id, currentUser.id);
        onReviewChanged(); // Trigger reload list
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="review-item border-b py-4">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold">{review.userName}</span>
        <span className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <div className="text-yellow-500 mb-2">
        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
      </div>
      
      <p className="text-gray-700">{review.comment}</p>

      {/* Chỉ hiện nút Xóa nếu là người tạo đánh giá */}
      {isOwner && (
        <div className="mt-2">
          <button 
            onClick={handleDelete}
            className="text-red-500 text-sm hover:underline"
          >
            Xóa đánh giá
          </button>
          {/* Bạn có thể thêm nút Update ở đây nếu cần */}
        </div>
      )}
    </div>
  );
};

export default ReviewItem;