import './VoucherValidationMessage.css';

const formatCurrency = (amount) => {
    return `${Number(amount).toLocaleString('vi-VN')} ₫`;
};

const VoucherValidationMessage = ({ result }) => {
    if (!result?.message) {
        return null;
    }

    return (
        <div
            className={`voucher-validation-message ${
                result.isValid ? 'is-success' : 'is-error'
            }`}
            role={result.isValid ? 'status' : 'alert'}
        >
            <p>{result.message}</p>

            {result.isValid && (
                <p className="voucher-validation-detail">
                    Giảm {formatCurrency(result.discountAmount)}
                    {' '}({result.discountPercent}%)
                    {' · '}
                    Tổng tiền sau giảm: {formatCurrency(result.finalAmount)}
                </p>
            )}
        </div>
    );
};

export default VoucherValidationMessage;