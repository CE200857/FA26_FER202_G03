import { useState } from 'react';
import './VoucherForm.css';

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getInitialFormData = (voucher) => ({
    code: voucher?.code ?? '',
    discountPercent: String(voucher?.discountPercent ?? 10),
    minOrderValue: String(voucher?.minOrderValue ?? 0),
    expiryDate: voucher?.expiryDate ?? '',
    usageLimit: String(voucher?.usageLimit ?? 50),
    isActive: voucher?.isActive ?? true,
});

const VoucherForm = ({
    onSubmit,
    onCancel,
    error,
    onClearError,
    initialData = null,
}) => {
    const [formData, setFormData] = useState(
        () => getInitialFormData(initialData)
    );
    const [validationError, setValidationError] = useState('');

    const today = getTodayDate();
    const isEditing = Boolean(initialData);
    const usedCount = initialData?.usedCount ?? 0;

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }));

        setValidationError('');
        onClearError();
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const code = formData.code.trim().toUpperCase();
        const discountPercent = Number(formData.discountPercent);
        const minOrderValue = Number(formData.minOrderValue);
        const usageLimit = Number(formData.usageLimit);

        if (!code) {
            setValidationError('Vui lòng nhập mã voucher.');
            return;
        }

        if (!/^[A-Z0-9_-]+$/.test(code)) {
            setValidationError(
                'Mã voucher chỉ được chứa chữ cái, số, dấu gạch ngang hoặc gạch dưới.'
            );
            return;
        }

        if (
            !Number.isInteger(discountPercent) ||
            discountPercent < 1 ||
            discountPercent > 100
        ) {
            setValidationError('Mức giảm giá phải từ 1% đến 100%.');
            return;
        }

        if (
            !Number.isInteger(minOrderValue) ||
            minOrderValue < 0
        ) {
            setValidationError(
                'Giá trị đơn hàng tối thiểu phải là số nguyên không âm.'
            );
            return;
        }

        const isOldExpiryDateUnchanged =
            isEditing &&
            formData.expiryDate === initialData.expiryDate;

        if (
            !formData.expiryDate ||
            (formData.expiryDate < today && !isOldExpiryDateUnchanged)
        ) {
            setValidationError(
                'Hạn sử dụng phải là hôm nay hoặc một ngày trong tương lai.'
            );
            return;
        }

        if (
            !Number.isInteger(usageLimit) ||
            usageLimit < 1
        ) {
            setValidationError(
                'Số lượt sử dụng tối đa phải là số nguyên lớn hơn 0.'
            );
            return;
        }

        if (isEditing && usageLimit < usedCount) {
            setValidationError(
                'Số lượt sử dụng tối đa không được nhỏ hơn số lượt đã sử dụng.'
            );
            return;
        }

        onSubmit({
            code,
            discountPercent,
            minOrderValue,
            expiryDate: formData.expiryDate,
            usageLimit,
            isActive: formData.isActive,
        });
    };

    return (
        <section className="voucher-form-card">
            <div className="voucher-form-header">
                <h3>
                    {isEditing ? 'Cập nhật voucher' : 'Tạo voucher mới'}
                </h3>
                <p>
                    {isEditing
                        ? 'Chỉnh sửa thông tin voucher.'
                        : 'Nhập thông tin mã giảm giá cho cửa hàng.'}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="voucher-form-grid">
                    <div className="voucher-form-field">
                        <label htmlFor="voucher-code">
                            Mã voucher
                        </label>
                        <input
                            id="voucher-code"
                            name="code"
                            type="text"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="Ví dụ: GIAM10"
                            maxLength={30}
                            required
                        />
                    </div>

                    <div className="voucher-form-field">
                        <label htmlFor="voucher-discount">
                            Mức giảm giá (%)
                        </label>
                        <input
                            id="voucher-discount"
                            name="discountPercent"
                            type="number"
                            value={formData.discountPercent}
                            onChange={handleChange}
                            min="1"
                            max="100"
                            step="1"
                            required
                        />
                    </div>

                    <div className="voucher-form-field">
                        <label htmlFor="voucher-min-order">
                            Đơn hàng tối thiểu (VND)
                        </label>
                        <input
                            id="voucher-min-order"
                            name="minOrderValue"
                            type="number"
                            value={formData.minOrderValue}
                            onChange={handleChange}
                            min="0"
                            step="1"
                            required
                        />
                    </div>

                    <div className="voucher-form-field">
                        <label htmlFor="voucher-expiry">
                            Hạn sử dụng
                        </label>
                        <input
                            id="voucher-expiry"
                            name="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            min={isEditing ? undefined : today}
                            required
                        />
                    </div>

                    <div className="voucher-form-field">
                        <label htmlFor="voucher-usage-limit">
                            Số lượt sử dụng tối đa
                        </label>
                        <input
                            id="voucher-usage-limit"
                            name="usageLimit"
                            type="number"
                            value={formData.usageLimit}
                            onChange={handleChange}
                            min={Math.max(1, usedCount)}
                            step="1"
                            required
                        />
                    </div>

                    <label className="voucher-form-checkbox">
                        <input
                            name="isActive"
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                        {isEditing
                            ? 'Kích hoạt voucher'
                            : 'Kích hoạt voucher ngay sau khi tạo'}
                    </label>
                </div>

                {validationError && (
                    <p className="voucher-form-error" role="alert">
                        {validationError}
                    </p>
                )}

                {error && (
                    <p className="voucher-form-error" role="alert">
                        {error}
                    </p>
                )}

                <div className="voucher-form-actions">
                    <button
                        type="button"
                        className="voucher-cancel-button"
                        onClick={onCancel}
                    >
                        Hủy
                    </button>

                    <button
                        type="submit"
                        className="voucher-submit-button"
                    >
                        {isEditing ? 'Lưu thay đổi' : 'Tạo voucher'}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default VoucherForm;