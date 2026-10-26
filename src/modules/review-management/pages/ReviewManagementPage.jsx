// src/modules/review-management/pages/ReviewModerationPage.jsx
import React, { useEffect, useState } from 'react';
import { reviewService } from '../../../services/reviewService';

const ReviewModerationPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // pending, approved, rejected

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAllReviewsForAdmin();
      setReviews(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const handleModerate = async (reviewId, newStatus) => {
    try {
      await reviewService.moderateReview(reviewId, newStatus);
      fetchAllReviews(); // Tải lại danh sách
    } catch (error) {
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  const displayedReviews = reviews.filter(r => r.status === statusFilter);

  return (
    <div className="review-moderation-page p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý Đánh giá (Admin)</h1>
      
      {/* Tabs lọc trạng thái */}
      <div className="mb-4 space-x-2">
        <button 
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded ${statusFilter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Chờ duyệt
        </button>
        <button 
          onClick={() => setStatusFilter('approved')}
          className={`px-4 py-2 rounded ${statusFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Đã duyệt
        </button>
        <button 
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 rounded ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Đã từ chối
        </button>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Người dùng</th>
                <th className="border p-2 text-left">Sản phẩm (ID)</th>
                <th className="border p-2 text-center">Sao</th>
                <th className="border p-2 text-left">Nội dung</th>
                <th className="border p-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {displayedReviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="border p-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                displayedReviews.map(review => (
                  <tr key={review.id} className="border-t hover:bg-gray-50">
                    <td className="border p-2">{review.userName}</td>
                    <td className="border p-2">{review.productId}</td>
                    <td className="border p-2 text-center">{review.rating}</td>
                    <td className="border p-2">{review.comment}</td>
                    <td className="border p-2 text-center space-x-2">
                      {statusFilter === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleModerate(review.id, 'approved')}
                            className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                          >
                            Duyệt
                          </button>
                          <button 
                            onClick={() => handleModerate(review.id, 'rejected')}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      
                      {statusFilter === 'approved' && (
                        <button 
                          onClick={() => handleModerate(review.id, 'rejected')}
                          className="bg-orange-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Ẩn (Reject)
                        </button>
                      )}
                      
                      {statusFilter === 'rejected' && (
                        <button 
                          onClick={() => handleModerate(review.id, 'approved')}
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Duyệt lại
                        </button>
                      )}
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