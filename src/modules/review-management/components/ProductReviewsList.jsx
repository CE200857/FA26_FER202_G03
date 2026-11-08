// src/modules/review-management/components/ProductReviewsList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { reviewService } from '../../../services/reviewService';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';

const ProductReviewsList = ({ productId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState('all');

  const fetchReviewsData = useCallback(async () => {
    setLoading(true);
    try {
      const [list, sumData] = await Promise.all([
        reviewService.getReviewsByProductId(productId),
        reviewService.getReviewSummary(productId),
      ]);
      setReviews(list || []);
      setSummary(sumData || { average: 0, total: 0 });
    } catch (err) {
      console.error('Lỗi khi tải đánh giá:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  const handleCreateReview = async (formData) => {
    try {
      await reviewService.createReview({
        productId,
        userId: currentUser.id,
        userName: currentUser.name || 'Khách hàng',
        ...formData,
      });
      alert('Đã gửi đánh giá! Bài viết đang chờ duyệt.');
      fetchReviewsData();
    } catch (err) {
      alert(err.message || 'Gửi đánh giá thất bại');
    }
  };

  const handleUpdateReview = async (reviewId, updatedData) => {
    try {
      await reviewService.updateReview(reviewId, currentUser.id, updatedData);
      fetchReviewsData();
    } catch (err) {
      alert(err.message || 'Cập nhật thất bại');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        await reviewService.deleteReview(reviewId, currentUser.id);
        fetchReviewsData();
      } catch (err) {
        alert(err.message || 'Xóa thất bại');
      }
    }
  };

  const filteredReviews = reviews.filter((r) =>
    starFilter === 'all' ? true : r.rating === Number(starFilter)
  );

  return (
    <div className="product-reviews-container">
      <div className="bg-light p-4 rounded-3 border mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h5 className="fw-bold mb-1">Đánh giá từ khách hàng</h5>
          <p className="text-muted small mb-0">Dựa trên {summary.total} nhận xét</p>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="display-5 fw-bold text-dark">{summary.average}</div>
          <div>
            <div className="text-warning fs-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(summary.average) ? 'text-warning' : 'text-secondary opacity-25'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-muted small">Trung bình trên 5 sao</span>
          </div>
        </div>
      </div>

      <ReviewForm onSubmit={handleCreateReview} />

      <div className="d-flex align-items-center gap-2 mb-4 flex-wrap border-bottom pb-3">
        <span className="fw-bold small text-secondary me-2">Lọc đánh giá:</span>
        {['all', 5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => setStarFilter(star)}
            className={`btn btn-sm rounded-pill px-3 ${
              String(starFilter) === String(star)
                ? 'btn-primary'
                : 'btn-outline-secondary'
            }`}
          >
            {star === 'all' ? `Tất cả (${reviews.length})` : `${star} sao`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-4 text-muted">Đang tải đánh giá...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-3 text-muted">
          Chưa có đánh giá nào phù hợp.
        </div>
      ) : (
        filteredReviews.map((item) => (
          <ReviewItem
            key={item.id}
            review={item}
            currentUser={currentUser}
            onUpdate={handleUpdateReview}
            onDelete={handleDeleteReview}
          />
        ))
      )}
    </div>
  );
};

export default ProductReviewsList;