import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { orderService } from '../../../services/orderService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useToast } from '../../../components/common/Toast';
import ConfirmModal from '../../../components/common/ConfirmModal';

const ORDER_STATUSES = {
  Pending: { label: 'Chờ xác nhận', className: 'bg-warning text-dark' },
  Shipping: { label: 'Đang giao hàng', className: 'bg-primary' },
  Completed: { label: 'Đã hoàn thành', className: 'bg-success' },
  Cancelled: { label: 'Đã hủy', className: 'bg-secondary' },
};

const formatDate = (value) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? '—' : new Date(timestamp).toLocaleString('vi-VN');
};

const OrderHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const userId = user?.id == null ? null : String(user.id);
  const [state, setState] = useState({ ownerId: null, orders: [], loading: false, error: '' });
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelState, setCancelState] = useState({ ownerId: null, id: null, error: '' });
  const requestVersion = useRef(0);
  const cancelRequest = useRef(null);

  useEffect(() => {
    const version = ++requestVersion.current;
    cancelRequest.current = null;
    setSelectedOrder(null);
    setCancelState({ ownerId: userId, id: null, error: '' });
    setState({ ownerId: userId, orders: [], loading: Boolean(userId), error: '' });

    const loadOrders = async () => {
      try {
        const orders = await orderService.getOrdersByUser(userId);
        if (version !== requestVersion.current) return;
        setState({ ownerId: userId, orders, loading: false, error: '' });
      } catch {
        if (version !== requestVersion.current) return;
        setState({ ownerId: userId, orders: [], loading: false, error: 'Không tải được lịch sử đơn hàng. Vui lòng bấm Tải lại.' });
      }
    };

    if (userId) loadOrders();
    return () => { requestVersion.current += 1; };
  }, [userId, reloadKey]);

  const isLoading = state.ownerId !== userId || state.loading;
  const orders = state.ownerId === userId ? state.orders : [];
  const cancellingId = cancelState.ownerId === userId ? cancelState.id : null;
  const cancelError = cancelState.ownerId === userId ? cancelState.error : '';

  const handleCancelOrder = async () => {
    if (!userId || !selectedOrder || selectedOrder.ownerId !== userId || isLoading || cancelRequest.current || cancelError) return;
    const id = String(selectedOrder.id);
    const request = { version: requestVersion.current, ownerId: userId };
    cancelRequest.current = request;
    setSelectedOrder(null);
    setCancelState({ ownerId: userId, id, error: '' });

    try {
      const updatedOrder = await orderService.cancelOrder(id, userId);
      if (request.version !== requestVersion.current) return;
      setState((previous) => previous.ownerId !== userId ? previous : {
        ...previous,
        orders: previous.orders.map((order) => String(order.id) === id ? updatedOrder : order),
      });
      toast.success(`Đã hủy đơn #${id}.`);
    } catch (requestError) {
      if (request.version !== requestVersion.current) return;
      const message = requestError.request || requestError.response
        ? 'Chưa xác nhận được kết quả hủy đơn. Bấm Tải lại để kiểm tra trước khi thử lại.'
        : requestError.message;
      setCancelState({ ownerId: userId, id: null, error: message || 'Không hủy được đơn hàng. Vui lòng bấm Tải lại.' });
    } finally {
      if (cancelRequest.current === request) cancelRequest.current = null;
      if (request.version === requestVersion.current) setCancelState((previous) => ({ ...previous, id: null }));
    }
  };

  if (!userId) {
    return (
      <section className="container py-4">
        <h2>Lịch sử mua hàng</h2>
        <p>Vui lòng đăng nhập để xem đơn hàng của bạn.</p>
        <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
      </section>
    );
  }

  return (
    <section className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="mb-0">Lịch sử mua hàng</h2>
        <button type="button" className="btn btn-outline-primary" onClick={() => setReloadKey((value) => value + 1)} disabled={isLoading || cancellingId !== null}>Tải lại</button>
      </div>

      {cancelError && <div className="alert alert-danger" role="alert">{cancelError}</div>}

      {isLoading ? (
        <p role="status">Đang tải đơn hàng...</p>
      ) : state.error ? (
        <div className="alert alert-danger" role="alert">{state.error}</div>
      ) : orders.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p>Bạn chưa có đơn hàng nào.</p>
            <Link to="/products" className="btn btn-outline-primary">Xem sản phẩm</Link>
          </div>
        </div>
      ) : orders.map((order) => {
        const id = String(order.id);
        const status = ORDER_STATUSES[order.status] || { label: order.status || 'Chưa xác định', className: 'bg-secondary' };

        const isCompleted =
          order.status === 'Completed' ||
          order.status === 'Đã hoàn thành' ||
          order.status === 'completed';

        const items = Array.isArray(order.items) ? order.items : [];

        return (
          <article key={id} className="card mb-4 shadow-sm">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <strong className="text-break">Đơn hàng #{id}</strong>
              <span className={`badge ${status.className}`}>{status.label}</span>
            </div>

            <div className="card-body">
              <p className="mb-2"><strong>Ngày đặt: </strong>{formatDate(order.createdAt)}</p>
              <p className="text-break"><strong>Địa chỉ giao hàng: </strong>{order.shippingAddress || 'Chưa có thông tin'}</p>

              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Sản phẩm</th>
                      <th scope="col" className="text-end">Đơn giá</th>
                      <th scope="col" className="text-center">Số lượng</th>
                      <th scope="col" className="text-end">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const productId = item.productId || item.id || item.product_id || 'P001';

                      return (
                        <tr key={productId ?? index}>
                          <td>
                            <div className="fw-medium text-dark">{item.name}</div>

                            {/* ĐÃ SỬA ĐƯỜNG DẪN LINK CHUẨN VỀ /reviews */}
                            {isCompleted && (
                              <div className="mt-1">
                                <Link
                                  to={`/reviews?productId=${productId}&orderId=${encodeURIComponent(id)}`}
                                  onClick={() => window.scrollTo(0, 0)}
                                  className="btn btn-sm btn-outline-primary py-0 px-2 rounded-pill shadow-sm"
                                  style={{ fontSize: '0.8rem', fontWeight: '500' }}
                                >
                                  ⭐ Viết đánh giá
                                </Link>
                              </div>
                            )}
                          </td>
                          <td className="text-end">{formatCurrency(Number(item.price) || 0)}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-end">
                <p className="mb-1">Tạm tính: {formatCurrency(Number(order.subtotal) || 0)}</p>
                {Number(order.discountAmount) > 0 && (
                  <p className="mb-1 text-success">Giảm giá{order.voucherCode ? ` (${order.voucherCode})` : ''}: −{formatCurrency(Number(order.discountAmount))}</p>
                )}
                <p className="fs-5 fw-bold mb-0">Tổng cộng: {formatCurrency(Number(order.totalAmount) || 0)}</p>
                {order.status === 'Pending' && String(order.userId) === userId && (
                  <button type="button" className="btn btn-outline-danger mt-3" onClick={() => setSelectedOrder({ id, ownerId: userId })} disabled={cancellingId !== null || Boolean(cancelError)}>
                    {cancellingId === id ? 'Đang hủy...' : 'Hủy đơn'}
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}

      <ConfirmModal isOpen={selectedOrder?.ownerId === userId && !isLoading} title="Hủy đơn hàng" message={`Bạn muốn hủy đơn #${selectedOrder?.id ?? ''}?`} confirmText="Xác nhận hủy" cancelText="Giữ đơn" danger onConfirm={handleCancelOrder} onCancel={() => setSelectedOrder(null)} />
    </section>
  );
};

export default OrderHistoryPage;