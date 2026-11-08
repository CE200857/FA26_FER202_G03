import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { voucherService } from '../../../services/voucherService';
import { voucherClaimService } from '../../../services/voucherClaimService';
import VoucherCard from '../components/VoucherCard';
import './MyVouchersPage.css';

const MyVouchersPage = () => {
    const { user, isAuthenticated } = useContext(AuthContext);

    const userId = user?.id;

    const [vouchers, setVouchers] = useState([]);
    const [claimedVoucherIds, setClaimedVoucherIds] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // Ngăn gửi nhiều yêu cầu nhận cùng một voucher liên tiếp
    const claimingIds = useRef(new Set());

    // Tải voucher và danh sách voucher người dùng đã nhận
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setMessage('');

                const allVouchers = await voucherService.getAll();

                let claims = [];

                if (userId) {
                    claims = await voucherClaimService.getByUser(userId);
                }

                if (!isMounted) return;

                setVouchers(allVouchers);

                setClaimedVoucherIds(
                    claims.map((claim) => String(claim.voucherId))
                );
            } catch (error) {
                if (isMounted) {
                    setMessage(
                        error.message || 'Không thể tải danh sách voucher.'
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [userId]);

    // Xử lý nhận voucher
    const handleClaimVoucher = async (voucherId) => {
        if (!isAuthenticated || !userId) {
            setMessage('Vui lòng đăng nhập để nhận voucher.');
            return;
        }

        const normalizedId = String(voucherId);

        if (claimingIds.current.has(normalizedId)) {
            return;
        }

        claimingIds.current.add(normalizedId);

        try {
            setMessage('');

            await voucherClaimService.claim(userId, voucherId);

            setClaimedVoucherIds((previous) => {
                if (previous.includes(normalizedId)) {
                    return previous;
                }

                return [...previous, normalizedId];
            });

            setMessage('Nhận voucher thành công!');
        } catch (error) {
            setMessage(error.message || 'Không thể nhận voucher.');
        } finally {
            claimingIds.current.delete(normalizedId);
        }
    };

    const today = voucherClaimService.getTodayDate();

    const availableVouchers = vouchers.filter((voucher) => {
        return (
            voucher.isActive &&
            voucher.expiryDate &&
            voucher.expiryDate >= today &&
            Number(voucher.usedCount) < Number(voucher.usageLimit)
        );
    });

    return (
        <section className="my-vouchers-page">
            <div className="my-vouchers-header">
                <h2>Voucher của tôi</h2>

                <p>
                    Khám phá các mã giảm giá đang khả dụng
                    tại cửa hàng Spa &amp; Salon.
                </p>
            </div>

            {message && (
                <p className="my-vouchers-message" role="status">
                    {message}
                </p>
            )}

            {loading ? (
                <div className="my-vouchers-empty">
                    <p>Đang tải danh sách voucher...</p>
                </div>
            ) : availableVouchers.length > 0 ? (
                <>
                    <p className="my-vouchers-count">
                        Hiện có {availableVouchers.length} voucher khả dụng
                    </p>

                    <div className="my-vouchers-grid">
                        {availableVouchers.map((voucher) => (
                            <VoucherCard
                                key={voucher.id}
                                voucher={voucher}
                                userId={userId}
                                claimed={claimedVoucherIds.includes(
                                    String(voucher.id)
                                )}
                                onClaim={handleClaimVoucher}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className="my-vouchers-empty">
                    <h3>Chưa có voucher khả dụng</h3>

                    <p>
                        Các voucher mới sẽ xuất hiện tại đây
                        khi có chương trình giảm giá.
                    </p>
                </div>
            )}
        </section>
    );
};

export default MyVouchersPage;