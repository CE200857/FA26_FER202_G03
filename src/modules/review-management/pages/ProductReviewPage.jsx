// src/modules/review-management/pages/ProductReviewPage.jsx
import React, { useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import ProductReviewsList from '../components/ProductReviewsList';

const ProductReviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Đọc mã sản phẩm và mã đơn hàng từ đường dẫn URL (/reviews?productId=...&orderId=...)
  const productId = searchParams.get('productId') || 'P001';
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId, orderId]);

  const { user } = useContext(AuthContext);
  const storedUser = localStorage.getItem('user');
  const parsedStored = storedUser ? JSON.parse(storedUser) : null;

  const currentUser = user || parsedStored || null;

  return (
    <div className="container py-4" style={{ maxWidth: '960px' }}>
      <div className="d-flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => navigate('/orders/history')}
          className="btn btn-outline-secondary btn-sm rounded-2"
        >
          ← Quay lại Lịch sử đơn hàng
        </button>
        <Link to="/products" className="btn btn-outline-secondary btn-sm rounded-2">
          🛍️ Danh sách sản phẩm
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <div>
              <h1 className="h4 fw-bold text-dark m-0">
                Đánh giá & Nhận xét sản phẩm
              </h1>
              <span className="text-muted small">
                Tài khoản: <strong>{currentUser?.name || currentUser?.userName || 'Khách hàng'}</strong>
              </span>
            </div>
            <div className="d-flex gap-2">
              {orderId && (
                <span className="badge bg-secondary fs-6 px-3 py-2 rounded-pill">
                  Đơn hàng: #{orderId}
                </span>
              )}
              <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                Mã SP: {productId}
              </span>
            </div>
          </div>

          <ProductReviewsList productId={productId} orderId={orderId} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default ProductReviewPage;