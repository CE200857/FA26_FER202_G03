import './VoucherCard.css';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(amount) || 0);

const formatDate = (dateString) => {
  if (!dateString) {
    return '—';
  }

  const [year, month, day] = dateString.split('-');

  return `${day}/${month}/${year}`;
};

const VoucherCard = ({
  voucher,
  userId,
  claimed,
  onClaim,
}) => {
  const remainingUses = Math.max(
    0,
    Number(voucher.usageLimit) -
      Number(voucher.usedCount)
  );

  return (
    <article className="my-voucher-card">
      <div className="my-voucher-discount">
        <span>GIẢM</span>
        <strong>{voucher.discountPercent}%</strong>
      </div>

      <div className="my-voucher-content">
        <span className="my-voucher-label">
          VOUCHER
        </span>

        <h3 className="my-voucher-code">
          {voucher.code}
        </h3>

        <div className="my-voucher-details">
          <p>
            <span>Đơn tối thiểu</span>
            <strong>
              {formatCurrency(voucher.minOrderValue)}
            </strong>
          </p>

          <p>
            <span>Hạn sử dụng</span>
            <strong>
              {formatDate(voucher.expiryDate)}
            </strong>
          </p>

          <p>
            <span>Lượt sử dụng còn lại</span>
            <strong>{remainingUses}</strong>
          </p>
        </div>

        <button
          type="button"
          className="my-voucher-claim-button"
          disabled={!userId || claimed}
          onClick={() => onClaim(voucher.id)}
        >
          {!userId
            ? 'Đăng nhập để nhận'
            : claimed
              ? 'Đã nhận'
              : 'Nhận voucher'}
        </button>
      </div>
    </article>
  );
};

export default VoucherCard;