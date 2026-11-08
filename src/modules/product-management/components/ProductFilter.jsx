import { useId } from 'react';
import '../product-management.css';

/**
 * Props:
 *  - categories, brands: arrays of option strings
 *  - filters: { category, brand, minPrice, maxPrice } (all strings)
 *  - priceError: message shown when the price range is invalid ('' if fine)
 *  - hasActiveFilters: show the reset button
 *  - onChange(partialFilters), onReset()
 */
export default function ProductFilter({
  categories,
  brands,
  filters,
  priceError,
  hasActiveFilters,
  onChange,
  onReset,
}) {
  const uid = useId();
  const errorId = `${uid}-price-error`;

  return (
    <div className="pm-filter" role="group" aria-label="Bộ lọc sản phẩm">
      <div className="pm-field">
        <label htmlFor={`${uid}-category`}>Danh mục</label>
        <select
          id={`${uid}-category`}
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value })}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="pm-field">
        <label htmlFor={`${uid}-brand`}>Thương hiệu</label>
        <select
          id={`${uid}-brand`}
          value={filters.brand}
          onChange={(event) => onChange({ brand: event.target.value })}
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="pm-field">
        <label htmlFor={`${uid}-min`}>Giá từ (₫)</label>
        <input
          id={`${uid}-min`}
          type="number"
          inputMode="numeric"
          min="0"
          step="1000"
          placeholder="0"
          value={filters.minPrice}
          aria-invalid={Boolean(priceError)}
          aria-describedby={priceError ? errorId : undefined}
          onChange={(event) => onChange({ minPrice: event.target.value })}
        />
      </div>

      <div className="pm-field">
        <label htmlFor={`${uid}-max`}>Giá đến (₫)</label>
        <input
          id={`${uid}-max`}
          type="number"
          inputMode="numeric"
          min="0"
          step="1000"
          placeholder="Không giới hạn"
          value={filters.maxPrice}
          aria-invalid={Boolean(priceError)}
          aria-describedby={priceError ? errorId : undefined}
          onChange={(event) => onChange({ maxPrice: event.target.value })}
        />
      </div>

      {hasActiveFilters && (
        <button type="button" className="pm-btn pm-btn--ghost" onClick={onReset}>
          Xóa bộ lọc
        </button>
      )}

      {priceError && (
        <p id={errorId} className="pm-filter__error" role="alert">
          {priceError}
        </p>
      )}
    </div>
  );
}