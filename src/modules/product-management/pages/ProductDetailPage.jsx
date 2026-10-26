import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { getProductById } from '../../../services/productService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getStockInfo } from '../stockStatus';
import '../product-management.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'notFound' | 'ready'
  const [quantity, setQuantity] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const [addedQuantity, setAddedQuantity] = useState(0);

  const loadProduct = useCallback(async () => {
    setStatus('loading');
    setImageFailed(false);
    setAddedQuantity(0);
    setQuantity(1);
    try {
      const found = await getProductById(id);
      setProduct(found);
      setStatus(found ? 'ready' : 'notFound');
    } catch {
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (status === 'loading') {
    return (
      <section className="pm-page" aria-busy="true" aria-label="Đang tải sản phẩm">
        <div className="pm-detail">
          <div className="pm-skeleton pm-skeleton--square" />
          <div className="pm-skeleton pm-skeleton--block" />
        </div>
      </section>
    );
  }

  if (status === 'error' || status === 'notFound') {
    return (
      <section className="pm-page">
        <div className="pm-state" role={status === 'error' ? 'alert' : undefined}>
          <p>
            {status === 'error'
              ? 'Không tải được sản phẩm.'
              : 'Không tìm thấy sản phẩm này. Có thể sản phẩm đã bị gỡ.'}
          </p>
          {status === 'error' && (
            <button type="button" className="pm-btn pm-btn--inline" onClick={loadProduct}>
              Thử lại
            </button>
          )}
          <Link to="/products" className="pm-back">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </section>
    );
  }

  // Business rule: stock is never negative, and the cart can never hold
  // more than the stock (cartService caps it too).
  const stock = Math.max(0, Number(product.stock) || 0);
  const { label, tone } = getStockInfo(stock);
  const inCart = cartItems.find((item) => item.id === product.id)?.quantity ?? 0;
  const remaining = Math.max(0, stock - inCart);
  const safeQuantity = remaining === 0 ? 0 : Math.min(Math.max(1, quantity), remaining);

  const changeQuantity = (next) => {
    const value = Number(next);
    if (Number.isNaN(value)) return;
    setQuantity(Math.min(Math.max(1, Math.floor(value)), Math.max(1, remaining)));
  };

  const handleAddToCart = () => {
    if (safeQuantity === 0) return;
    // TODO: once the Account module is merged, show the login popup for guests here.
    addToCart(product, safeQuantity);
    setAddedQuantity(safeQuantity);
    setQuantity(1);
  };

  let buttonText = 'Thêm vào giỏ';
  if (stock === 0) buttonText = 'Hết hàng';
  else if (remaining === 0) buttonText = 'Đã có tối đa trong giỏ';

  return (
    <section className="pm-page">
      <Link to="/products" className="pm-back">
        Quay lại danh sách sản phẩm
      </Link>

      <div className="pm-detail">
        <div className="pm-detail__media">
          {product.image && !imageFailed ? (
            <img src={product.image} alt={product.name} onError={() => setImageFailed(true)} />
          ) : (
            <span className="pm-card__placeholder" aria-hidden="true">
              {product.name?.charAt(0)}
            </span>
          )}
        </div>

        <div className="pm-detail__info">
          <h1>{product.name}</h1>
          <p className="pm-detail__price">{formatCurrency(product.price)}</p>

          <dl className="pm-detail__facts">
            <div>
              <dt>Thương hiệu</dt>
              <dd>{product.brand}</dd>
            </div>
            <div>
              <dt>Danh mục</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt>Tình trạng</dt>
              <dd className={`pm-card__stock--${tone}`}>{label}</dd>
            </div>
          </dl>

          {stock > 0 && (
            <div className="pm-qty">
              <label htmlFor="pm-qty-input">Số lượng</label>
              <div className="pm-qty__control">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  disabled={safeQuantity <= 1}
                  onClick={() => changeQuantity(safeQuantity - 1)}
                >
                  −
                </button>
                <input
                  id="pm-qty-input"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={Math.max(1, remaining)}
                  value={safeQuantity || 1}
                  disabled={remaining === 0}
                  onChange={(event) => changeQuantity(event.target.value)}
                />
                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  disabled={safeQuantity >= remaining}
                  onClick={() => changeQuantity(safeQuantity + 1)}
                >
                  +
                </button>
              </div>
              {inCart > 0 && <p className="pm-qty__note">Trong giỏ của bạn đã có {inCart}.</p>}
            </div>
          )}

          <button
            type="button"
            className="pm-btn pm-btn--detail"
            disabled={remaining === 0}
            onClick={handleAddToCart}
          >
            {buttonText}
          </button>
          <p className="pm-detail__feedback" role="status">
            {addedQuantity > 0 && `Đã thêm ${addedQuantity} sản phẩm vào giỏ hàng.`}
          </p>

          <h2>Mô tả sản phẩm</h2>
          <p className="pm-detail__description">{product.description}</p>
        </div>
      </div>

      {/* Reviews (Khánh): render <ProductReviewsList productId={product.id} currentUser={...} />
          inside this section once review-management is merged into main. */}
      <section className="pm-detail__reviews" aria-label="Đánh giá sản phẩm" />
    </section>
  );
}