import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthContext } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../components/common/Toast';
import { orderService } from '../../../services/orderService';
import { formatCurrency } from '../../../utils/formatCurrency';
import CartSummary from '../components/CartSummary';

const CheckoutPage = () => {
    const { user } = useContext(AuthContext);
    const { cartItems, subtotal, isLoading, isUpdating, error: cartError, reloadCart, clearCart } = useCart();
    const toast = useToast();
    const navigate = useNavigate();
    const userId = user?.id == null ? null : String(user.id);
    const [form, setForm] = useState({ recipientName: user?.name || '', phone: '', shippingAddress: '', });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [needsHistoryCheck, setNeedsHistoryCheck] = useState(false);
    const submittingRef = useRef(false);
    const session = useRef(0);

    useEffect(() => {
        session.current += 1;

        return () => {
            session.current += 1;
        };
    }, [userId]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submittingRef.current || isLoading || isUpdating || !userId) {
            return;
        }

        submittingRef.current = true;
        setIsSubmitting(true);
        setError('');

        const ownerSession = session.current;

        let createdOrder;

        try {
            createdOrder = await orderService.createOrder({
                userId,
                recipientName: form.recipientName,
                phone: form.phone,
                shippingAddress: form.shippingAddress,
            });
        } catch (requestError) {
            if (ownerSession !== session.current) return;

            const uncertainResult = requestError.config?.method?.toLowerCase() === 'post' &&
                (
                    !requestError.response || requestError.response.status >= 500
                );

            if (uncertainResult) {
                setError(
                    'Chưa xác nhận được kết quả đặt hàng. ' + 'Vui lòng kiểm tra lịch sử đơn hàng trước khi đặt lại.'
                );
            } else if (
                requestError.request || requestError.response
            ) {
                setError(
                    'Không thể tạo đơn hàng. ' + 'Vui lòng kiểm tra kết nối với json-server và thử lại.'
                );
            } else {
                setError(
                    requestError.message || 'Không thể tạo đơn hàng.'
                );
            }

            setNeedsHistoryCheck(uncertainResult);
            submittingRef.current = uncertainResult;
            setIsSubmitting(false);
            return;
        }

        if (ownerSession !== session.current) return;

        const cleared = await clearCart();

        if (ownerSession !== session.current) return;

        if (cleared) {
            toast.success(
                `Đã tạo đơn hàng #${createdOrder.id}.`
            );
        } else {
            toast.info(
                `Đơn #${createdOrder.id} đã được tạo, ` + 'nhưng chưa xóa được giỏ hàng. ' + 'Hãy kiểm tra lịch sử trước khi đặt lại.'
            );
        }
        navigate('/orders/history', { replace: true });
    };

    if (!userId) {
        return (
            <section className="container py-4">
                <h2>Thanh toán đơn hàng</h2>
                <p>Vui lòng đăng nhập để đặt hàng.</p>

                <Link to="/login" className="btn btn-primary">
                    Đăng nhập
                </Link>
            </section>
        );
    }

    if (isLoading) {
        return (
            <section className="container py-4">
                <h2>Thanh toán đơn hàng</h2>
                <p role="status">Đang tải giỏ hàng...</p>
            </section>
        );
    }

    if (cartError && !isSubmitting) {
        return (
            <section className="container py-4">
                <h2>Thanh toán đơn hàng</h2>

                <div className="alert alert-danger" role="alert">
                    <p>{cartError}</p>

                    <button type="button" className="btn btn-outline-danger" onClick={reloadCart} disabled={isUpdating}>
                        Tải lại giỏ hàng
                    </button>
                </div>
            </section>
        );
    }

    if (cartItems.length === 0 && !isSubmitting) {
        return (
            <section className="container py-4">
                <h2>Thanh toán đơn hàng</h2>
                <p>Giỏ hàng đang trống.</p>

                <Link to="/products" className="btn btn-outline-primary">
                    Xem sản phẩm
                </Link>
            </section>
        );
    }
    const isBusy = isSubmitting || isUpdating;

    return (
        <section className="container py-4">
            <h2 className="mb-4">Thanh toán đơn hàng</h2>

            {error && (
                <div className="alert alert-danger" role="alert">
                    <p className="mb-2">{error}</p>

                    {needsHistoryCheck && (
                        <Link to="/orders/history" className="alert-link">
                            Kiểm tra lịch sử đơn hàng
                        </Link>
                    )}
                </div>
            )}
            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="h5 mb-3">
                                Thông tin giao hàng
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <fieldset disabled={isBusy || needsHistoryCheck}>
                                    <div className="mb-3">
                                        <label htmlFor="recipientName" className="form-label">
                                            Họ tên người nhận
                                        </label>
                                        <input id="recipientName" name="recipientName" type="text" className="form-control" autoComplete="name" value={form.recipientName} onChange={handleChange} required />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="phone" className="form-label">
                                            Số điện thoại
                                        </label>
                                        <input id="phone" name="phone" type="tel" className="form-control" autoComplete="tel" placeholder="Ví dụ: 0987654321" value={form.phone} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="shippingAddress" className="form-label">
                                            Địa chỉ giao hàng
                                        </label>
                                        <textarea id="shippingAddress" name="shippingAddress" className="form-control" autoComplete="street-address" rows={3} value={form.shippingAddress} onChange={handleChange} required />
                                    </div>
                                    <button type="submit" className="btn btn-success w-100">
                                        {isSubmitting ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'}
                                    </button>
                                </fieldset>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="h5 mb-3">
                                Sản phẩm trong đơn
                            </h3>
                            <ul className="list-group list-group-flush mb-3">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="list-group-item px-0">
                                        <p className="fw-semibold mb-1"> {item.name}</p>
                                        <div className="d-flex justify-content-between gap-2">
                                            <span> {item.quantity} ×{' '} {formatCurrency(Number(item.price))} </span>
                                            <strong> {formatCurrency( Number(item.price) * Number(item.quantity))}</strong>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <CartSummary subtotal={subtotal} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckoutPage;