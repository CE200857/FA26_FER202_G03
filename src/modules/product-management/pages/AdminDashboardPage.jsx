import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../../services/productService';
import { request } from '../../../services/api';
import { formatCurrency } from '../../../utils/formatCurrency';
import {
  ORDER_STATUSES,
  summarizeInventory,
  summarizeOrders,
  summarizeReviews,
} from '../dashboardStats';
import '../product-management.css';

const STATUS_LABELS = Object.fromEntries(ORDER_STATUSES.map((status) => [status.value, status.label]));

function StatCard({ label, value, note }) {
  return (
    <div className="pm-stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
      {note && <p>{note}</p>}
    </div>
  );
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'ready'

  const loadData = useCallback(async () => {
    setStatus('loading');
    try {
      const products = await getProducts({ includeHidden: true });
      const [orders, reviews] = await Promise.all([
        request('/orders'),
        request('/reviews'),
      ]);
      const reviewList = reviews.map((review) => ({
        ...review,
        isHidden: review.status !== 'approved',
      }));
      setData({
        inventory: summarizeInventory(products),
        orders: summarizeOrders(orders),
        reviews: summarizeReviews(reviewList),
      });
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (status === 'loading') {
    return (
      <section className="pm-page pm-page--admin" aria-busy="true">
        <div className="pm-state">
          <p>Đang tải số liệu tổng quan...</p>
        </div>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="pm-page pm-page--admin">
        <div className="pm-state" role="alert">
          <p>Không tải được số liệu tổng quan.</p>
          <button type="button" className="pm-btn pm-btn--inline" onClick={loadData}>
            Thử lại
          </button>
        </div>
      </section>
    );
  }

  const { inventory, orders, reviews } = data;
  const maxStatusCount = Math.max(1, ...Object.values(orders.byStatus));

  return (
    <section className="pm-page pm-page--admin pm-dash">
      <section aria-labelledby="dash-products">
        <div className="pm-dash__heading">
          <h2 id="dash-products">Sản phẩm và tồn kho</h2>
          <Link to="/admin/products">Quản lý sản phẩm</Link>
        </div>
        <dl className="pm-stats">
          <StatCard label="Tổng sản phẩm" value={inventory.total} />
          <StatCard label="Đang hiển thị" value={inventory.visible} note={`${inventory.hidden} sản phẩm đã ẩn`} />
          <StatCard label="Hết hàng" value={inventory.outOfStock} note="Đang hiển thị nhưng tồn kho 0" />
          <StatCard label="Sắp hết hàng" value={inventory.lowStock} note="Còn 5 sản phẩm trở xuống" />
          <StatCard label="Giá trị tồn kho" value={formatCurrency(inventory.stockValue)} note="Theo giá bán hiện tại" />
        </dl>
      </section>

      <section aria-labelledby="dash-restock">
        <div className="pm-dash__heading">
          <h2 id="dash-restock">Cần nhập thêm hàng</h2>
        </div>
        {inventory.needsRestock.length === 0 ? (
          <div className="pm-state">
            <p>Tồn kho đang ổn: không có sản phẩm nào hết hàng hoặc sắp hết.</p>
          </div>
        ) : (
          <div className="pm-table-wrap">
            <table className="pm-table pm-table--compact">
              <caption className="pm-sr-only">Sản phẩm hết hàng hoặc sắp hết hàng</caption>
              <thead>
                <tr>
                  <th scope="col">Sản phẩm</th>
                  <th scope="col">Danh mục</th>
                  <th scope="col" className="pm-table__num">Tồn kho</th>
                  <th scope="col">Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {inventory.needsRestock.slice(0, 8).map((product) => {
                  const stock = Math.max(0, Number(product.stock) || 0);
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="pm-table__name">{product.name}</div>
                        <div className="pm-table__sub">
                          {product.id} · {product.brand}
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td className="pm-table__num">{stock}</td>
                      <td>
                        <span className={`pm-badge ${stock === 0 ? 'pm-badge--out' : 'pm-badge--pending'}`}>
                          {stock === 0 ? 'Hết hàng' : 'Sắp hết'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {inventory.needsRestock.length > 8 && (
          <p className="pm-results">
            Đang hiển thị 8 trong {inventory.needsRestock.length} sản phẩm.{' '}
            <Link to="/admin/products">Xem toàn bộ trong Quản lý sản phẩm</Link>
          </p>
        )}
      </section>

      <section aria-labelledby="dash-orders">
        <div className="pm-dash__heading">
          <h2 id="dash-orders">Đơn hàng</h2>
          <Link to="/admin/orders">Quản lý đơn hàng</Link>
        </div>
        <dl className="pm-stats">
          <StatCard label="Tổng đơn hàng" value={orders.total} />
          <StatCard label="Chờ xử lý" value={orders.byStatus.Pending} />
          <StatCard label="Doanh thu" value={formatCurrency(orders.revenue)} note="Chỉ tính đơn đã hoàn thành" />
        </dl>

        {orders.total === 0 ? (
          <div className="pm-state">
            <p>Chưa có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="pm-dash__split">
            <div>
              <h3>Theo trạng thái</h3>
              <ul className="pm-bars">
                {ORDER_STATUSES.map((orderStatus) => {
                  const count = orders.byStatus[orderStatus.value];
                  return (
                    <li key={orderStatus.value}>
                      <span className="pm-bars__label">{orderStatus.label}</span>
                      <span className="pm-bars__track" aria-hidden="true">
                        <span
                          className={`pm-bars__fill pm-bars__fill--${orderStatus.value.toLowerCase()}`}
                          style={{ width: `${(count / maxStatusCount) * 100}%` }}
                        />
                      </span>
                      <span className="pm-bars__count">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3>Đơn gần đây</h3>
              <div className="pm-table-wrap">
                <table className="pm-table pm-table--compact">
                  <caption className="pm-sr-only">Đơn hàng gần đây</caption>
                  <thead>
                    <tr>
                      <th scope="col">Mã đơn</th>
                      <th scope="col">Ngày</th>
                      <th scope="col" className="pm-table__num">Tổng tiền</th>
                      <th scope="col">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.recent.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td className="pm-table__num">{formatCurrency(Number(order.totalAmount) || 0)}</td>
                        <td>
                          <span className={`pm-badge pm-badge--${String(order.status).toLowerCase()}`}>
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="dash-reviews">
        <div className="pm-dash__heading">
          <h2 id="dash-reviews">Đánh giá của khách</h2>
          <Link to="/admin/reviews">Kiểm duyệt đánh giá</Link>
        </div>
        <dl className="pm-stats">
          <StatCard label="Đánh giá hiển thị" value={reviews.visible} />
          <StatCard
            label="Điểm trung bình"
            value={reviews.average === null ? '—' : `${reviews.average.toFixed(1)} / 5`}
            note={reviews.average === null ? 'Chưa có đánh giá' : undefined}
          />
          <StatCard label="Đã ẩn" value={reviews.hidden} note="Vi phạm hoặc bị kiểm duyệt" />
        </dl>
      </section>
    </section>
  );
}