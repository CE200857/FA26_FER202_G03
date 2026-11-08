// src/modules/review-management/pages/ProductReviewPage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductReviewsList from '../components/ProductReviewsList';

const ProductReviewPage = () => {
  const { id } = useParams();
  const productId = id || 'P001';

  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : {
    id: 'U002',
    name: 'Khách hàng Thân thiết',
    role: 'Customer',
  };

  return (
    <div className="container py-4" style={{ maxWidth: '960px' }}>
      <div className="mb-3">
        <Link to="/products" className="btn btn-outline-secondary btn-sm rounded-2">
          ← Quay lại Danh sách sản phẩm
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h1 className="h4 fw-bold text-dark m-0">
              Đánh giá & Nhận xét sản phẩm
            </h1>
            <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
              Mã SP: {productId}
            </span>
          </div>

          <ProductReviewsList productId={productId} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default ProductReviewPage;