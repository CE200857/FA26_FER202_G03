import React, { useState } from 'react';

/**
 * Component ReviewModeration - Kiểm duyệt đánh giá dành cho Admin / Moderator
 * @param {Array} reviews - Danh sách các đánh giá
 * @param {Function} onUpdateStatus - Hàm cập nhật trạng thái (approved, rejected, pending)
 * @param {Function} onDeleteReview - Hàm xóa đánh giá
 */
const ReviewModeration = ({ reviews = [], onUpdateStatus, onDeleteReview }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc danh sách theo trạng thái và từ khóa tìm kiếm
  const filteredReviews = reviews.filter((review) => {
    const matchesStatus =
      filterStatus === 'all' || review.status === filterStatus;
    const matchesSearch =
      (review.userName && review.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.productName && review.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Badge trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Đã duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Đã ẩn / Từ chối
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý & Kiểm duyệt Đánh giá</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số đánh giá: <span className="font-semibold text-gray-700">{reviews.length}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Ô tìm kiếm */}
          <input
            type="text"
            placeholder="Tìm theo tên, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Lọc theo trạng thái */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã ẩn / Từ chối</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách đánh giá */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
              <th className="py-3 px-4">Người dùng</th>
              <th className="py-3 px-4">Sản phẩm</th>
              <th className="py-3 px-4">Số sao</th>
              <th className="py-3 px-4">Nội dung đánh giá</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4">Ngày gửi</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  Không tìm thấy đánh giá nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {review.userName || 'Khách hàng'}
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[150px] truncate">
                    {review.productName || `#${review.productId}`}
                  </td>
                  <td className="py-3 px-4 text-yellow-500 font-bold">
                    {review.rating} ★
                  </td>
                  <td className="py-3 px-4 text-gray-700 max-w-xs truncate" title={review.comment}>
                    {review.comment}
                  </td>
                  <td className="py-3 px-4">
                    {renderStatusBadge(review.status)}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => onUpdateStatus && onUpdateStatus(review.id, 'approved')}
                        className="px-2.5 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Duyệt
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => onUpdateStatus && onUpdateStatus(review.id, 'rejected')}
                        className="px-2.5 py-1 text-xs font-medium bg-amber-500 text-white rounded hover:bg-amber-600 transition"
                      >
                        Ẩn
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteReview && onDeleteReview(review.id)}
                      className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition"
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
    </div>
  );
};

export default ReviewModeration;