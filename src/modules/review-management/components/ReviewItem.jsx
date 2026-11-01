import React from 'react';

const ReviewItem = ({ review, currentUserId, onEdit, onDelete }) => {
  const isOwner = currentUserId && review.userId === currentUserId;

  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
            {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800">{review.userName || 'Người dùng'}</h4>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= review.rating ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'}>
                  ★
                </span>
              ))}
              <span className="text-xs text-gray-400 ml-2">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Nút Sửa / Xóa cho chủ bài viết */}
        {isOwner && (
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => onEdit(review)}
              className="text-blue-600 hover:underline font-medium"
            >
              Sửa
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => onDelete(review.id)}
              className="text-red-600 hover:underline font-medium"
            >
              Xóa
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
    </div>
  );
};

export default ReviewItem;