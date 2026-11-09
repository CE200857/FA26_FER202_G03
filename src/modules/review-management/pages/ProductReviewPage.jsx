// src/modules/review-management/pages/ProductReviewPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import ProductReviewsList from '../components/ProductReviewsList';

const BASE_URL = 'http://localhost:5001';

const ProductReviewPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Đọc productId và orderId từ URL query
  const queryProductId = searchParams.get('productId');
  const orderId = searchParams.get('orderId');

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách sản phẩm:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Xác định productId hiện tại (Nếu URL không có thì lấy sản phẩm đầu tiên trong danh sách)
  const currentProductId =
    queryProductId || (products.length > 0 ? String(products[0].id) : 'P001');

  // Tìm thông tin sản phẩm đang được chọn
  const selectedProduct = products.find(
    (p) => String(p.id).trim() === String(currentProductId).trim()
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentProductId, orderId]);

  const { user } = useContext(AuthContext);
  const storedUser = localStorage.getItem('user');
  const parsedStored = storedUser ? JSON.parse(storedUser) : null;
  const currentUser = user || parsedStored || null;

  // Xử lý khi người dùng chọn sản phẩm khác từ Dropdown
  const handleSelectProduct = (e) => {
    const newProductId = e.target.value;
    // Cập nhật lại tham số productId trên URL
    setSearchParams({ productId: newProductId });
  };

  return (
    <div className="container py-4" style={{ maxWidth: '960px' }}>
      {/* THANH ĐIỀU HƯỚNG & BỘ CHỌN SẢN PHẨM */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
        <div className="d-flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/orders/history')}
            className="btn btn-outline-secondary btn-sm rounded-2"
          >
            ← Lịch sử đơn hàng
          </button>
          <Link to="/products" className="btn btn-outline-secondary btn-sm rounded-2">
            🛍️ Danh sách sản phẩm
          </Link>
        </div>

        {/* DROPDOWN CHỌN SẢN PHẨM */}
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="productSelect" className="fw-semibold small text-secondary mb-0 text-nowrap">
            Chọn sản phẩm:
          </label>
          {loadingProducts ? (
            <span className="small text-muted">Đang tải SP...</span>
          ) : (
            <select
              id="productSelect"
              className="form-select form-select-sm fw-medium shadow-sm"
              style={{ minWidth: '240px' }}
              value={currentProductId}
              onChange={handleSelectProduct}
            >
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.id})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 flex-wrap gap-2">
            <div>
              <h1 className="h4 fw-bold text-dark m-0">
                Đánh giá & Nhận xét sản phẩm
              </h1>
              <p className="text-primary fw-semibold fs-5 mb-0 mt-1">
                {selectedProduct ? selectedProduct.name : `Sản phẩm #${currentProductId}`}
              </p>
              <span className="text-muted small">
                Tài khoản: <strong>{currentUser?.name || currentUser?.userName || 'Khách hàng'}</strong>
              </span>
            </div>
            <div className="d-flex gap-2 align-items-center">
              {orderId && (
                <span className="badge bg-secondary fs-6 px-3 py-2 rounded-pill">
                  Đơn hàng: #{orderId}
                </span>
              )}
              <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                Mã SP: {currentProductId}
              </span>
            </div>
          </div>

          <ProductReviewsList
            productId={currentProductId}
            orderId={orderId}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductReviewPage;