// src/modules/review-management/components/ProductReviewsList.jsx
import React, { useEffect, useState } from 'react';
import { reviewService } from '../../../services/reviewService';
import ReviewItem from './ReviewItem';

const ProductReviewsList = ({ productId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0); // 0 = All

  const fetchReviewsData = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getReviewsByProductId(productId);
      const stats = await reviewService.getReviewSummary(productId);
      setReviews(data);
      setSummary(stats);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, [productId]);

  const handleReviewChanged = () => {
    fetchReviewsData();
  };

  // Lọc đánh giá
  const filteredReviews = filterRating === 0 
    ? reviews 
    : reviews.filter(r => r.rating === filterRating);

  if (loading) return <div>Đang tải đánh giá...</div>;

  return (
    <div className="product-reviews mt-6">
      {/* Thống kê - Bạn có thể tách ra thành ReviewSummary.jsx nếu muốn */}
      {summary && (
        <div className="review-summary flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded">
          <div className="text-3xl font-bold text-yellow-500">
            {summary.average} <span className="text-xl">/ 5</span>
          </div>
          <div>
            <p>{summary.total} đánh giá</p>
          </div>
        </div>
      )}

      {/* Bộ lọc */}
      <div className="mb-4">
        <span className="mr-2">Lọc theo:</span>
        <select 
          value={filterRating} 
          onChange={(e) => setFilterRating(Number(e.target.value))}
          className="border p-1 rounded"
        >
          <option value={0}>Tất cả sao</option>
          <option value={5}>5 Sao</option>
          <option value={4}>4 Sao</option>
          <option value={3}>3 Sao</option>
          <option value={2}>2 Sao</option>
          <option value={1}>1 Sao</option>
        </select>
      </div>

      {/* Danh sách */}
      <div className="review-list">
        {filteredReviews.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có đánh giá nào phù hợp.</p>
        ) : (
          filteredReviews.map(review => (
            <ReviewItem 
              key={review.id} 
              review={review} 
              currentUser={currentUser}
              onReviewChanged={handleReviewChanged}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviewsList;