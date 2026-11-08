import { Fragment, useEffect, useRef, useState } from 'react';
import { orderService } from '../../../services/orderService';
import { useToast } from '../../../components/common/Toast';
import { formatCurrency } from '../../../utils/formatCurrency';

const STATUS_LABELS = { Pending: 'Chờ xử lý', Shipping: 'Đang giao', Completed: 'Hoàn tất', Cancelled: 'Đã hủy' };
const STATUS_COLORS = { Pending: 'bg-warning text-dark', Shipping: 'bg-primary', Completed: 'bg-success', Cancelled: 'bg-secondary' };
const NEXT_STATUSES = { Pending: ['Shipping', 'Cancelled'], Shipping: ['Completed'], Completed: [], Cancelled: [] };
const ACTION_LABELS = { Shipping: 'Giao hàng', Completed: 'Hoàn tất', Cancelled: 'Hủy đơn' };

const formatDate = (value) => {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? '—' : new Date(timestamp).toLocaleString('vi-VN');
};

const OrderManagement = () => {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const requestVersion = useRef(0);
    const savingRef = useRef(false);

    useEffect(() => {
        const version = ++requestVersion.current;
        setIsLoading(true);
        setError('');
        const loadOrders = async () => {
            try {
                const data = await orderService.getAllOrders();
                if (version === requestVersion.current) setOrders(data);
            } catch (requestError) {
                if (version !== requestVersion.current) return;
                setOrders([]);
                const message = requestError.request || requestError.response
                    ? 'Không tải được đơn hàng. Kiểm tra json-server và bấm Tải lại.'
                    : requestError.message;
                setError(message || 'Không tải được danh sách đơn hàng.');
            } finally {
                if (version === requestVersion.current) setIsLoading(false);
            }
        };
        loadOrders();
        return () => { requestVersion.current += 1; };
    }, [reloadKey]);

    const handleStatusChange = async (orderId, nextStatus) => {
        if (savingRef.current || isLoading || error) return;
        const id = String(orderId);
        const version = requestVersion.current;
        savingRef.current = true;
        setUpdatingId(id);
        try {
            const updatedOrder = await orderService.updateOrderStatus(id, nextStatus);
            if (version !== requestVersion.current) return;
            setOrders((previous) => previous.map((order) => String(order.id) === id ? updatedOrder : order));
            toast.success(`Đã cập nhật đơn #${id}.`);
        } catch (requestError) {
            if (version !== requestVersion.current) return;
            const message = requestError.request || requestError.response
                ? 'Chưa xác nhận được kết quả cập nhật. Bấm Tải lại để kiểm tra trạng thái đơn.'
                : requestError.message;
            setError(message || 'Không cập nhật được trạng thái. Vui lòng bấm Tải lại.');
        } finally {
            savingRef.current = false;
            if (version === requestVersion.current) setUpdatingId(null);
        }
    };

    const isBusy = isLoading || updatingId !== null;

    return (
        <section aria-label="Danh sách đơn hàng">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <span>{isLoading ? 'Đang tải đơn hàng...' : `${orders.length} đơn hàng`}</span>
                <button type="button" className="btn btn-outline-success" onClick={() => setReloadKey((value) => value + 1)} disabled={isBusy}>Tải lại</button>
            </div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {isLoading ? (
                <p role="status">Đang tải danh sách đơn hàng...</p>
            ) : orders.length === 0 ? (
                !error && <div className="alert alert-info">Chưa có đơn hàng nào.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                        <thead className="table-light">
                            <tr>
                                <th scope="col">Mã đơn</th>
                                <th scope="col">Người nhận</th>
                                <th scope="col">Ngày đặt</th>
                                <th scope="col">Tổng tiền</th>
                                <th scope="col">Trạng thái</th>
                                <th scope="col">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const id = String(order.id);
                                const items = Array.isArray(order.items) ? order.items : [];
                                const nextStatuses = Object.hasOwn(NEXT_STATUSES, order.status) ? NEXT_STATUSES[order.status] : [];
                                return (
                                    <Fragment key={id}>
                                        <tr>
                                            <td className="fw-semibold">#{id}</td>
                                            <td>
                                                <div>{order.recipientName || 'Chưa có tên người nhận'}</div>
                                                <small className="text-muted">Khách: {order.userId}</small>
                                            </td>
                                            <td className="text-nowrap">{formatDate(order.createdAt)}</td>
                                            <td className="text-nowrap">{formatCurrency(Number(order.totalAmount))}</td>
                                            <td><span className={`badge ${STATUS_COLORS[order.status] || 'bg-secondary'}`}>{STATUS_LABELS[order.status] || order.status || 'Không xác định'}</span></td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <button type="button" className="btn btn-sm btn-outline-secondary" aria-expanded={expandedId === id} onClick={() => setExpandedId((previous) => previous === id ? null : id)}>
                                                        {expandedId === id ? 'Ẩn chi tiết' : 'Chi tiết'}
                                                    </button>
                                                    {nextStatuses.map((status) => (
                                                        <button key={status} type="button" className={`btn btn-sm ${status === 'Cancelled' ? 'btn-outline-danger' : 'btn-outline-primary'}`} onClick={() => handleStatusChange(id, status)} disabled={isBusy || Boolean(error)}>
                                                            {ACTION_LABELS[status]}
                                                        </button>
                                                    ))}
                                                </div>
                                                {updatingId === id && <small className="text-muted" role="status">Đang cập nhật...</small>}
                                            </td>
                                        </tr>
                                        {expandedId === id && (
                                            <tr>
                                                <td colSpan={6} className="bg-light p-3">
                                                    <p className="mb-1"><strong>Số điện thoại:</strong> {order.phone || 'Chưa có thông tin'}</p>
                                                    <p className="mb-3"><strong>Địa chỉ giao hàng:</strong> {order.shippingAddress || 'Chưa có thông tin'}</p>
                                                    {items.length === 0 ? <p>Đơn hàng chưa có thông tin sản phẩm.</p> : (
                                                        <table className="table table-sm mb-3">
                                                            <thead>
                                                                <tr><th scope="col">Sản phẩm</th><th scope="col">Đơn giá</th><th scope="col">Số lượng</th><th scope="col">Thành tiền</th></tr>
                                                            </thead>
                                                            <tbody>
                                                                {items.map((item, index) => (
                                                                    <tr key={item.productId ?? index}>
                                                                        <td>{item.name}</td>
                                                                        <td>{formatCurrency(Number(item.price))}</td>
                                                                        <td>{item.quantity}</td>
                                                                        <td>{formatCurrency(Number(item.price) * Number(item.quantity))}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                    <div className="text-end">
                                                        <div>Tạm tính: {formatCurrency(Number(order.subtotal))}</div>
                                                        <div>Giảm giá: {formatCurrency(Number(order.discountAmount || 0))}</div>
                                                        <strong>Tổng cộng: {formatCurrency(Number(order.totalAmount))}</strong>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default OrderManagement;