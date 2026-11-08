import { useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    setVouchers(voucherService.getAll());

    if (userId) {
      const claims = voucherClaimService.getByUser(userId);

      setClaimedVoucherIds(
        claims.map((claim) => claim.voucherId)
      );
    } else {
      setClaimedVoucherIds([]);
    }
  }, [userId]);

  const handleClaimVoucher = (voucherId) => {
    try {
      if (!isAuthenticated || !userId) {
        setMessage('Vui lòng đăng nhập để nhận voucher.');
        return;
      }

      voucherClaimService.claim(userId, voucherId);

      setClaimedVoucherIds((previous) => [
        ...previous,
        voucherId,
      ]);

      setMessage('Nhận voucher thành công!');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const today = voucherClaimService.getTodayDate();

  const availableVouchers = vouchers.filter((voucher) => {
    return (
      voucher.isActive &&
      voucher.expiryDate &&
      voucher.expiryDate >= today &&
      Number(voucher.usedCount) <
        Number(voucher.usageLimit)
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

      {availableVouchers.length > 0 ? (
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
                claimed={claimedVoucherIds.includes(voucher.id)}
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