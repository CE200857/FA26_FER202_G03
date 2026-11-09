// src/modules/review-management/components/ReviewModeration.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { reviewService } from '../../../services/reviewService';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [starFilter, setStarFilter] = useState('all');

  const fetchAllReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAllReviewsForAdmin();
      setReviews(data || []);
    } catch (error) {
      console.error("Lỗi khi kết nối API reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  const handleDelete = async (reviewId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        await reviewService.deleteReview(reviewId, null, true);
        fetchAllReviews();
      } catch (error) {
        alert("Lỗi xóa bài: " + (error.message || error));
      }
    }
  };

  // Kết hợp lọc từ khóa tìm kiếm và lọc theo số sao
  const displayedReviews = reviews.filter((review) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (review.userName && review.userName.toLowerCase().includes(term)) ||
      (review.comment && review.comment.toLowerCase().includes(term)) ||
      (review.productId && String(review.productId).toLowerCase().includes(term));

    const matchesStar =
      starFilter === 'all' ? true : Number(review.rating) === Number(starFilter);

    return matchesSearch && matchesStar;
  });

  return (
    <div className="review-moderation-page p-4 bg-white rounded-3 shadow-sm border">
      {/* HEADER HÀNG ĐẦU */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Quản lý Đánh giá sản phẩm (Admin)</h4>
          <span className="text-muted small">
            Tổng số: <strong>{reviews.length}</strong> đánh giá
          </span>
        </div>
        <input
          type="text"
          placeholder="Tìm theo tên, nội dung, ID sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control form-control-sm"
          style={{ maxWidth: '300px' }}
        />
      </div>

      {/* BỘ LỌC SAO DẠNG NÚT PILL */}
      <div className="d-flex align-items-center gap-2 mb-4 flex-wrap pb-3 border-bottom">
        <span className="fw-bold small text-secondary me-2">Lọc theo số sao:</span>
        {['all', 5, 4, 3, 2, 1].map((star) => {
          const count = star === 'all' 
            ? reviews.length 
            : reviews.filter(r => Number(r.rating) === Number(star)).length;

          return (
            <button
              key={star}
              type="button"
              onClick={() => setStarFilter(star)}
              className={`btn btn-sm rounded-pill px-3 ${
                String(starFilter) === String(star)
                  ? 'btn-primary'
                  : 'btn-outline-secondary'
              }`}
            >
              {star === 'all' ? `Tất cả (${count})` : `${star} ★ (${count})`}
            </button>
          );
        })}
      </div>

      {/* BẢNG DANH SÁCH */}
      {loading ? (
        <div className="text-center py-4 text-muted">Đang tải dữ liệu...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle border text-sm">
            <thead className="table-light">
              <tr>
                <th>Người dùng</th>
                <th>Sản phẩm (ID)</th>
                <th className="text-center">Sao</th>
                <th>Nội dung nhận xét</th>
                <th className="text-center">Ngày đăng</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {displayedReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted fst-italic">
                    Không tìm thấy đánh giá nào trong danh mục này.
                  </td>
                </tr>
              ) : (
                displayedReviews.map((review) => (
                  <tr key={review.id}>
                    <td className="fw-bold text-dark">{review.userName || 'Khách hàng'}</td>
                    <td className="text-secondary fw-semibold">{review.productId}</td>
                    <td className="text-center text-warning fw-bold">{review.rating} ★</td>
                    <td className="text-secondary" style={{ maxWidth: '350px' }}>
                      {review.comment}
                    </td>
                    <td className="text-center text-muted small">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(review.id)}
                        className="btn btn-sm btn-outline-danger px-3 rounded-pill"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;