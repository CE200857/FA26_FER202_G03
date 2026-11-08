// src/modules/review-management/components/ProductReviewsList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { reviewService } from '../../../services/reviewService';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';

const ProductReviewsList = ({ productId, orderId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: 0, total: 0 });
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState('all');

  const fetchReviewsData = useCallback(async () => {
    setLoading(true);
    try {
      const [list, sumData, hasBought] = await Promise.all([
        reviewService.getReviewsByProductId(productId),
        reviewService.getReviewSummary(productId),
        currentUser?.id
          ? reviewService.canUserReview(currentUser.id, productId, orderId)
          : false,
      ]);

      setReviews(list || []);
      setSummary(sumData || { average: 0, total: 0 });
      setCanReview(hasBought);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu đánh giá:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, orderId, currentUser?.id]);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  // Kiểm tra xem user hiện tại đã viết đánh giá cho SẢN PHẨM NÀY trong ĐƠN HÀNG NÀY chưa
  const hasUserReviewedThisOrder = reviews.some((r) => {
    const isSameUser = String(r.userId) === String(currentUser?.id);
    const isSameProduct = String(r.productId) === String(productId);
    if (!isSameUser || !isSameProduct) return false;

    if (orderId) {
      return String(r.orderId) === String(orderId);
    }
    return false;
  });

  const handleCreateReview = async (formData) => {
    try {
      await reviewService.createReview({
        productId,
        orderId,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.userName || 'Khách hàng',
        ...formData,
      });
      alert('Đã gửi đánh giá cho đơn hàng thành công!');
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
    starFilter === 'all' ? true : Number(r.rating) === Number(starFilter)
  );

  return (
    <div className="product-reviews-container">
      {/* 1. KHỐI TỔNG QUAN */}
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
                <span
                  key={i}
                  className={i < Math.round(summary.average) ? 'text-warning' : 'text-secondary opacity-25'}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-muted small">Trung bình trên 5 sao</span>
          </div>
        </div>
      </div>

      {/* 2. KHỐI FORM VIẾT ĐÁNH GIÁ */}
      {!currentUser?.id ? (
        <div className="alert alert-warning border-0 shadow-sm rounded-3 mb-4">
          🔒 Vui lòng <strong>đăng nhập</strong> tài khoản đã mua sản phẩm để viết đánh giá.
        </div>
      ) : !canReview ? (
        <div className="alert alert-secondary border-0 shadow-sm rounded-3 mb-4">
          🔒 <strong>Chưa thể đánh giá:</strong> Bạn chưa mua sản phẩm này trong đơn hàng {orderId ? `#${orderId}` : ''} hoặc đơn hàng chưa ở trạng thái <strong>"Đã hoàn thành"</strong>.
        </div>
      ) : hasUserReviewedThisOrder ? (
        <div className="alert alert-info border-0 shadow-sm rounded-3 mb-4">
          💡 <strong>Bạn đã đánh giá sản phẩm này cho đơn hàng #{orderId}.</strong> Bạn có thể chỉnh sửa hoặc xóa đánh giá của mình ở danh sách bên dưới.
        </div>
      ) : (
        <ReviewForm onSubmit={handleCreateReview} />
      )}

      {/* 3. BỘ LỌC SAO */}
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

      {/* 4. DANH SÁCH BÀI ĐÁNH GIÁ */}
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