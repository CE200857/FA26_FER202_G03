import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { orderService } from '../../../services/orderService';
import { formatCurrency } from '../../../utils/formatCurrency';

const ORDER_STATUSES = {
  Pending: {
    label: 'Chờ xác nhận',
    className: 'bg-warning text-dark',
  },
  Shipping: {
    label: 'Đang giao hàng',
    className: 'bg-primary',
  },
  Completed: {
    label: 'Đã hoàn thành',
    className: 'bg-success',
  },
  Cancelled: {
    label: 'Đã hủy',
    className: 'bg-secondary',
  },
};

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('vi-VN');
};

const OrderHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const userId = user?.id == null ? null : String(user.id);

  const [reloadKey, setReloadKey] = useState(0);

  const [state, setState] = useState({
    ownerId: null,
    orders: [],
    loading: false,
    error: '',
  });

  useEffect(() => {
    let active = true;

    if (!userId) {
      setState({
        ownerId: null,
        orders: [],
        loading: false,
        error: '',
      });

      return () => {
        active = false;
      };
    }

    const loadOrders = async () => {
      setState({
        ownerId: userId,
        orders: [],
        loading: true,
        error: '',
      });

      try {
        const orders =
          await orderService.getOrdersByUser(userId);

        if (!active) return;

        setState({
          ownerId: userId,
          orders,
          loading: false,
          error: '',
        });
      } catch {
        if (!active) return;

        setState({
          ownerId: userId,
          orders: [],
          loading: false,
          error:
            'Không tải được lịch sử đơn hàng. Vui lòng thử lại.',
        });
      }
    };

    loadOrders();

    // Bỏ qua kết quả cũ khi đổi tài khoản hoặc rời trang.
    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  if (!userId) {
    return (
      <section className="container py-4">
        <h2>Lịch sử mua hàng</h2>
        <p>Vui lòng đăng nhập để xem đơn hàng của bạn.</p>

        <Link to="/login" className="btn btn-primary">
          Đăng nhập
        </Link>
      </section>
    );
  }

  const isLoading =
    state.ownerId !== userId || state.loading;

  const orders =
    state.ownerId === userId ? state.orders : [];

  return (
    <section className="container py-4">
      <h2 className="mb-4">Lịch sử mua hàng</h2>

      {isLoading ? (
        <p role="status">Đang tải đơn hàng...</p>
      ) : state.error ? (
        <div className="alert alert-danger" role="alert">
          <p>{state.error}</p>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() =>
              setReloadKey((previous) => previous + 1)
            }
          >
            Thử lại
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p>Bạn chưa có đơn hàng nào.</p>

            <Link
              to="/products"
              className="btn btn-outline-primary"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      ) : (
        orders.map((order) => {
          const status = ORDER_STATUSES[order.status] || {
            label: order.status || 'Chưa xác định',
            className: 'bg-secondary',
          };

          const items = Array.isArray(order.items)
            ? order.items
            : [];

          return (
            <article
              key={order.id}
              className="card mb-4 shadow-sm"
            >
              <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                <strong className="text-break">
                  Đơn hàng #{order.id}
                </strong>

                <span
                  className={`badge ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="card-body">
                <p className="mb-2">
                  <strong>Ngày đặt: </strong>
                  {formatDate(order.createdAt)}
                </p>

                <p className="text-break">
                  <strong>Địa chỉ giao hàng: </strong>
                  {order.shippingAddress || 'Chưa có thông tin'}
                </p>

                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th scope="col">Sản phẩm</th>
                        <th scope="col" className="text-end">
                          Đơn giá
                        </th>
                        <th scope="col" className="text-center">
                          Số lượng
                        </th>
                        <th scope="col" className="text-end">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={
                            item.productId ??
                            item.id ??
                            index
                          }
                        >
                          <td>{item.name}</td>

                          <td className="text-end">
                            {formatCurrency(
                              Number(item.price) || 0
                            )}
                          </td>

                          <td className="text-center">
                            {item.quantity}
                          </td>

                          <td className="text-end">
                            {formatCurrency(
                              (Number(item.price) || 0) *
                              (Number(item.quantity) || 0)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-end">
                  <p className="mb-1">
                    Tạm tính:{' '}
                    {formatCurrency(
                      Number(order.subtotal) || 0
                    )}
                  </p>

                  {Number(order.discountAmount) > 0 && (
                    <p className="mb-1 text-success">
                      Giảm giá
                      {order.voucherCode
                        ? ` (${order.voucherCode})`
                        : ''}
                      : −
                      {formatCurrency(
                        Number(order.discountAmount)
                      )}
                    </p>
                  )}

                  <p className="fs-5 fw-bold mb-0">
                    Tổng cộng:{' '}
                    {formatCurrency(
                      Number(order.totalAmount) || 0
                    )}
                  </p>
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
};

export default OrderHistoryPage;