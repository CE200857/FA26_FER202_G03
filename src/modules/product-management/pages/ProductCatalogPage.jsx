import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../../../context/CartContext';
import { getProducts } from '../../../services/productService';
import ProductFilter from '../components/ProductFilter';
import ProductSort from '../components/ProductSort';
import SearchBar from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';
import { DEFAULT_SORT, applyCatalogQuery, getOptions, parsePrice } from '../productQuery';
import '../product-management.css';

const SKELETON_COUNT = 8;
const PRODUCTS_PER_PAGE = 8;
const EMPTY_FILTERS = { category: '', brand: '', minPrice: '', maxPrice: '' };

export default function ProductCatalogPage() {
  const { addToCart } = useCart();
  const resultsRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'ready'
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

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
  const minPrice = parsePrice(filters.minPrice);
  const maxPrice = parsePrice(filters.maxPrice);
  const priceError =
    minPrice !== null && maxPrice !== null && minPrice > maxPrice
      ? 'Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa.'
      : '';
  const categories = useMemo(() => getOptions(products, 'category'), [products]);
  const brands = useMemo(() => getOptions(products, 'brand'), [products]);

  const results = useMemo(
    () =>
      applyCatalogQuery(products, {
        query,
        category: filters.category,
        brand: filters.brand,
        // An invalid range is ignored until the customer fixes it.
        minPrice: priceError ? null : minPrice,
        maxPrice: priceError ? null : maxPrice,
        sort,
      }),
    [products, query, filters.category, filters.brand, minPrice, maxPrice, priceError, sort],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = results.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const hasActiveFilters =
    query.trim() !== '' || Object.values(filters).some((value) => value !== '');

  // Any change to the search, filters or sort sends the customer back to page 1.
  const handleQueryChange = (value) => {
    setQuery(value);
    setPage(1);
  };
  const handleFilterChange = (changes) => {
    setFilters((previous) => ({ ...previous, ...changes }));
    setPage(1);
  };
  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };
  const handleReset = () => {
    setQuery('');
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };
  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    resultsRef.current?.scrollIntoView?.({ block: 'start' });
  };

  return (
  <section className="pm-page">
      <header className="pm-page__header">
        <h1>Sản phẩm</h1>
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
        <>
          <div className="pm-toolbar">
            <SearchBar
              value={query}
              onChange={handleQueryChange}
              label="Tìm sản phẩm theo tên hoặc mã"
              placeholder="Tìm theo tên hoặc mã sản phẩm (ví dụ: P001)"
            />
            <ProductSort value={sort} onChange={handleSortChange} />
          </div>

          <ProductFilter
            categories={categories}
            brands={brands}
            filters={filters}
            priceError={priceError}
            hasActiveFilters={hasActiveFilters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />

          <p className="pm-results" role="status" ref={resultsRef}>
            {results.length === 0
              ? 'Không có sản phẩm phù hợp.'
              : `Hiển thị ${startIndex + 1}–${startIndex + visibleProducts.length} trong ${results.length} sản phẩm`}
          </p>

          {results.length === 0 ? (
            <div className="pm-state">
              <p>Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác hoặc bỏ bớt bộ lọc.</p>
              {hasActiveFilters && (
                <button type="button" className="pm-btn pm-btn--inline" onClick={handleReset}>
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="pm-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}