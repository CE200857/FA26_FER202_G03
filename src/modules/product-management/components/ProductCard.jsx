import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getStockInfo } from '../stockStatus';
import '../product-management.css';

const ADDED_FEEDBACK_MS = 1500;

/**
 * Shows one product in the catalog grid.
 * Props:
 *  - product: { id, name, brand, category, price, stock, image }
 *  - onAddToCart(product): called when the customer clicks "Thêm vào giỏ"
 */
export default function ProductCard({ product, onAddToCart }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return undefined;
    const timer = setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [justAdded]);

  // Business rule: displayed stock is never negative.
  const stock = Math.max(0, Number(product.stock) || 0);
  const { label, tone } = getStockInfo(stock);
  const detailPath = `/products/${product.id}`;

  const handleAdd = () => {
    onAddToCart?.(product);
    setJustAdded(true);
  };

  let buttonText = 'Thêm vào giỏ';
  if (stock === 0) buttonText = 'Hết hàng';
  else if (justAdded) buttonText = 'Đã thêm vào giỏ';

  return (
    <article className="pm-card">
      <Link to={detailPath} className="pm-card__media" aria-label={`Xem ${product.name}`}>
        {product.image && !imageFailed ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="pm-card__placeholder" aria-hidden="true">
            {product.name?.charAt(0)}
          </span>
        )}
      </Link>

      <div className="pm-card__body">
        <p className="pm-card__brand">{product.brand}</p>
        <h3 className="pm-card__name">
          <Link to={detailPath}>{product.name}</Link>
        </h3>
        <p className="pm-card__category">{product.category}</p>

        <div className="pm-card__meta">
          <span className="pm-card__price">{formatCurrency(product.price)}</span>
          <span className={`pm-card__stock pm-card__stock--${tone}`}>{label}</span>
        </div>

        <button
          type="button"
          className="pm-btn"
          disabled={stock === 0}
          onClick={handleAdd}
          aria-live="polite"
        >
          {buttonText}
        </button>
      </div>
    </article>
  );
}