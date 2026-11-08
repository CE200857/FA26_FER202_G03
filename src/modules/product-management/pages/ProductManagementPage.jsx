import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import ProductFormModal from '../components/ProductFormModal';
import Pagination from '../../../components/common/Pagination';
import SearchBar from '../../../components/common/SearchBar';
import {
  createProduct,
  deleteProduct,
  getProducts,
  setProductHidden,
  updateProduct,
} from '../../../services/productService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { applyCatalogQuery, getOptions } from '../productQuery';
import '../product-management.css';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'selling', label: 'Đang bán' },
  { value: 'out', label: 'Hết hàng' },
  { value: 'hidden', label: 'Đã ẩn' },
];

function getProductStatus(product) {
  if (product.isHidden) return { key: 'hidden', label: 'Đã ẩn' };
  if (Number(product.stock) <= 0) return { key: 'out', label: 'Hết hàng' };
  return { key: 'selling', label: 'Đang bán' };
}

function ProductThumb({ product }) {
  const [failed, setFailed] = useState(false);

  if (product.image && !failed) {
    return <img className="pm-thumb" src={product.image} alt="" loading="lazy" onError={() => setFailed(true)} />;
  }
  return (
    <span className="pm-thumb pm-thumb--empty" aria-hidden="true">
      {product.name?.charAt(0)}
    </span>
  );
}

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'ready'
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [form, setForm] = useState(null); // null | { product: null | product }
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }

  const loadProducts = useCallback(async () => {
    setStatus('loading');
    try {
      setProducts(await getProducts({ includeHidden: true }));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!notice || notice.type === 'error') return undefined;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const categories = useMemo(() => getOptions(products, 'category'), [products]);

  const rows = useMemo(
    () =>
      applyCatalogQuery(products, { query, sort: 'newest' }).filter(
        (product) => statusFilter === 'all' || getProductStatus(product).key === statusFilter,
      ),
    [products, query, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = rows.slice(startIndex, startIndex + PAGE_SIZE);
  const hasFilters = query.trim() !== '' || statusFilter !== 'all';

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  // Called by the form modal; errors thrown here are shown inside the modal.
  const handleSave = async (values) => {
    if (form.product) {
      const updated = await updateProduct(form.product.id, values);
      setProducts((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
      setNotice({ type: 'success', text: `Đã cập nhật sản phẩm "${updated.name}".` });
    } else {
      const created = await createProduct(values);
      setProducts((previous) => [...previous, created]);
      setNotice({ type: 'success', text: `Đã thêm sản phẩm "${created.name}" (${created.id}).` });
      setPage(1);
    }
    setForm(null);
  };

  const handleToggleHidden = async (product) => {
    setBusyId(product.id);
    try {
      const updated = await setProductHidden(product.id, !product.isHidden);
      setProducts((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
      setNotice({
        type: 'success',
        text: updated.isHidden
          ? `Đã ẩn "${updated.name}" khỏi cửa hàng.`
          : `"${updated.name}" đã hiển thị lại với khách hàng.`,
      });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      const deletedId = await deleteProduct(toDelete.id);
      setProducts((previous) => previous.filter((item) => item.id !== deletedId));
      setNotice({ type: 'success', text: `Đã xóa sản phẩm "${toDelete.name}".` });
      setToDelete(null);
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="pm-page pm-page--admin">
      {notice && (
        <div className={`pm-notice pm-notice--${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          <span>{notice.text}</span>
          <button type="button" aria-label="Đóng thông báo" onClick={() => setNotice(null)}>
            ×
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="pm-state" aria-busy="true">
          <p>Đang tải danh sách sản phẩm...</p>
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

      {status === 'ready' && (
        <>
          <div className="pm-toolbar">
            <SearchBar
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              label="Tìm sản phẩm theo tên hoặc mã"
              placeholder="Tìm theo tên hoặc mã sản phẩm"
            />
            <div className="pm-field">
              <label htmlFor="pm-admin-status">Trạng thái</label>
              <select
                id="pm-admin-status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="pm-btn pm-btn--inline pm-toolbar__add" onClick={() => setForm({ product: null })}>
              Thêm sản phẩm
            </button>
          </div>

          {products.length === 0 ? (
            <div className="pm-state">
              <p>Chưa có sản phẩm nào. Bấm “Thêm sản phẩm” để bắt đầu.</p>
            </div>
          ) : (
            <>
              <p className="pm-results" role="status">
                {rows.length === 0
                  ? 'Không có sản phẩm phù hợp.'
                  : `Hiển thị ${startIndex + 1}–${startIndex + visibleRows.length} trong ${rows.length} sản phẩm`}
              </p>

              {rows.length === 0 ? (
                <div className="pm-state">
                  <p>Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác hoặc đổi bộ lọc.</p>
                  {hasFilters && (
                    <button type="button" className="pm-btn pm-btn--inline" onClick={resetFilters}>
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              ) : (
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <caption className="pm-sr-only">Danh sách sản phẩm</caption>
                    <thead>
                      <tr>
                        <th scope="col">Sản phẩm</th>
                        <th scope="col">Danh mục</th>
                        <th scope="col" className="pm-table__num">Giá</th>
                        <th scope="col" className="pm-table__num">Tồn kho</th>
                        <th scope="col">Trạng thái</th>
                        <th scope="col">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((product) => {
                        const productStatus = getProductStatus(product);
                        const busy = busyId === product.id;
                        return (
                          <tr key={product.id}>
                            <td>
                              <div className="pm-table__product">
                                <ProductThumb product={product} />
                                <div>
                                  <div className="pm-table__name">{product.name}</div>
                                  <div className="pm-table__sub">
                                    {product.id} · {product.brand}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>{product.category}</td>
                            <td className="pm-table__num">{formatCurrency(product.price)}</td>
                            <td className="pm-table__num">{Math.max(0, Number(product.stock) || 0)}</td>
                            <td>
                              <span className={`pm-badge pm-badge--${productStatus.key}`}>{productStatus.label}</span>
                            </td>
                            <td>
                              <div className="pm-row-actions">
                                <button
                                  type="button"
                                  className="pm-btn pm-btn--ghost pm-btn--small"
                                  disabled={busy}
                                  aria-label={`Sửa ${product.name}`}
                                  onClick={() => setForm({ product })}
                                >
                                  Sửa
                                </button>
                                <button
                                  type="button"
                                  className="pm-btn pm-btn--ghost pm-btn--small"
                                  disabled={busy}
                                  aria-label={`${product.isHidden ? 'Hiện' : 'Ẩn'} ${product.name}`}
                                  onClick={() => handleToggleHidden(product)}
                                >
                                  {product.isHidden ? 'Hiện' : 'Ẩn'}
                                </button>
                                <button
                                  type="button"
                                  className="pm-btn pm-btn--danger pm-btn--small"
                                  disabled={busy}
                                  aria-label={`Xóa ${product.name}`}
                                  onClick={() => {
                                    setDeleteError('');
                                    setToDelete(product);
                                  }}
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}

      {form && (
        <ProductFormModal
          product={form.product}
          categories={categories}
          onSubmit={handleSave}
          onClose={() => setForm(null)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Xóa sản phẩm?"
          message={`Bạn sắp xóa vĩnh viễn "${toDelete.name}" (${toDelete.id}). Thao tác này không thể hoàn tác. Nếu chỉ muốn ngừng bán tạm thời, hãy chọn "Ẩn" thay vì xóa.`}
          confirmLabel="Xóa sản phẩm"
          busyLabel="Đang xóa..."
          busy={deleting}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}