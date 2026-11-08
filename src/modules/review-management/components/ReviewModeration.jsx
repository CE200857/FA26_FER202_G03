// src/modules/review-management/pages/ReviewModerationPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { reviewService } from '../../../services/reviewService';

const ReviewModerationPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleModerate = async (reviewId, newStatus) => {
    try {
      await reviewService.moderateReview(reviewId, newStatus);
      fetchAllReviews();
    } catch (error) {
      alert("Lỗi duyệt bài: " + (error.message || error));
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hẳn đánh giá này?")) {
      try {
        await reviewService.deleteReview(reviewId, null, true);
        fetchAllReviews();
      } catch (error) {
        alert("Lỗi xóa bài: " + (error.message || error));
      }
    }
  };

  const displayedReviews = reviews.filter((review) => {
    const currentStatus = review.status || 'pending';
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
    const matchesSearch =
      (review.userName && review.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.productId && String(review.productId).toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="review-moderation-page p-4 bg-white rounded-3 shadow-sm border">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Quản lý & Kiểm duyệt Đánh giá (Admin)</h4>
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
          style={{ maxWidth: '280px' }}
        />
      </div>

      <div className="mb-4 border-bottom pb-3 d-flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending', label: 'Chờ duyệt' },
          { key: 'approved', label: 'Đã duyệt' },
          { key: 'rejected', label: 'Đã từ chối / Ẩn' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`btn btn-sm rounded-pill ${
              statusFilter === tab.key ? 'btn-primary' : 'btn-outline-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
                <th className="text-center">Trạng thái</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {displayedReviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted fs-6 italic">
                    Không tìm thấy đánh giá nào trong danh mục này.
                  </td>
                </tr>
              ) : (
                displayedReviews.map((review) => (
                  <tr key={review.id}>
                    <td className="fw-bold text-dark">{review.userName || 'Khách hàng'}</td>
                    <td className="text-secondary">{review.productId}</td>
                    <td className="text-center text-warning fw-bold">{review.rating} ★</td>
                    <td className="text-secondary" style={{ maxWidth: '300px' }}>{review.comment}</td>
                    <td className="text-center">
                      <span className={`badge ${
                        review.status === 'approved' ? 'bg-success' :
                        review.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                        {review.status === 'approved' ? 'Đã duyệt' :
                         review.status === 'rejected' ? 'Đã ẩn' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        {review.status !== 'approved' && (
                          <button onClick={() => handleModerate(review.id, 'approved')} className="btn btn-outline-success">
                            Duyệt
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button onClick={() => handleModerate(review.id, 'rejected')} className="btn btn-outline-warning text-dark">
                            Ẩn
                          </button>
                        )}
                        <button onClick={() => handleDelete(review.id)} className="btn btn-outline-danger">
                          Xóa
                        </button>
                      </div>
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

export default ReviewModerationPage;