// src/modules/review-management/components/ReviewItem.jsx
import React, { useState } from 'react';
import ReviewForm from './ReviewForm';

const ReviewItem = ({ review, currentUser, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const isOwner = currentUser && (currentUser.id === review.userId || currentUser.userId === review.userId);

  if (isEditing) {
    return (
      <ReviewForm
        initialData={review}
        onSubmit={(updatedData) => {
          onUpdate(review.id, updatedData);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const initialLetter = (review.userName || 'K').charAt(0).toUpperCase();

  return (
    <div className="card border-0 shadow-sm mb-3 bg-white rounded-3">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle bg-danger text-white fw-bold d-flex align-items-center justify-content-center"
              style={{ width: '38px', height: '38px', fontSize: '1rem' }}
            >
              {initialLetter}
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark">{review.userName || 'Khách hàng'}</h6>
              <span className="text-muted small">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
              </span>
            </div>
          </div>

          {isOwner && (
            <div className="btn-group btn-group-sm">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-link text-decoration-none text-primary p-0 me-3"
              >
                Sửa
              </button>
              <button
                onClick={() => onDelete(review.id)}
                className="btn btn-link text-decoration-none text-danger p-0"
              >
                Xóa
              </button>
            </div>
          )}
        </div>

        <div className="mb-2">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`fs-5 me-1 ${index < review.rating ? 'text-warning' : 'text-secondary opacity-25'}`}
            >
              ★
            </span>
          ))}
        </div>

        <p className="card-text text-secondary mb-0" style={{ lineHeight: '1.5' }}>
          {review.comment}
        </p>
      </div>
    </div>
  );
};

export default ReviewItem;