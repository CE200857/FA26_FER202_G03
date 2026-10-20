import { useCallback, useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../../../context/CartContext';
import { getProducts } from '../../../services/productService';
import '../product-management.css';

const SKELETON_COUNT = 8;

export default function ProductCatalogPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'ready'

  const loadProducts = useCallback(async () => {
    setStatus('loading');
    try {
      setProducts(await getProducts());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // cartService already caps the quantity at the product's stock.
  // TODO: once the Account module is merged, show the login popup for guests here.
  const handleAddToCart = (product) => addToCart(product, 1);

  return (
    <section className="pm-page">
      <header className="pm-page__header">
        <h1>Sản phẩm</h1>
        {status === 'ready' && products.length > 0 && (
          <p className="pm-page__count">{products.length} sản phẩm</p>
        )}
      </header>

      {status === 'loading' && (
        <div className="pm-grid" aria-busy="true" aria-label="Đang tải sản phẩm">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div key={index} className="pm-skeleton" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="pm-state" role="alert">
          <p>Không tải được danh sách sản phẩm.</p>
          <button type="button" className="pm-btn pm-btn--inline" onClick={loadProducts}>
            Thử lại
          </button>
        </div>
      )}

      {status === 'ready' && products.length === 0 && (
        <div className="pm-state">
          <p>Chưa có sản phẩm nào. Sản phẩm mới sẽ xuất hiện ở đây khi cửa hàng thêm vào.</p>
        </div>
      )}

      {status === 'ready' && products.length > 0 && (
        <div className="pm-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
}