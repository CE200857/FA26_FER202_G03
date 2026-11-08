import { STORAGE_KEYS, storageService } from './storageService';

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const voucherService = {
    getAll() {
        return storageService.get(STORAGE_KEYS.VOUCHERS, []);
    },

    getById(id) {
        return this.getAll().find((voucher) => voucher.id === id) || null;
    },

    validateVoucher(code, orderAmount) {
        const normalizedCode = String(code ?? '').trim().toUpperCase();

        if (!normalizedCode) {
            return {
                isValid: false,
                message: 'Vui lòng nhập mã voucher.',
            };
        }

        const amount = Number(orderAmount);

        if (
            orderAmount === null ||
            orderAmount === undefined ||
            orderAmount === '' ||
            !Number.isFinite(amount) ||
            amount < 0
        ) {
            return {
                isValid: false,
                message: 'Giá trị đơn hàng không hợp lệ.',
            };
        }

        const voucher = this.getAll().find(
            (item) =>
                String(item.code ?? '').trim().toUpperCase() === normalizedCode
        );

        if (!voucher) {
            return {
                isValid: false,
                message: 'Mã voucher không tồn tại.',
            };
        }

        if (voucher.isActive !== true) {
            return {
                isValid: false,
                message: 'Voucher hiện không được kích hoạt.',
            };
        }

        const today = getTodayDate();

        if (!voucher.expiryDate || voucher.expiryDate < today) {
            return {
                isValid: false,
                message: 'Voucher đã hết hạn sử dụng.',
            };
        }

        const usedCount = Number(voucher.usedCount ?? 0);
        const usageLimit = Number(voucher.usageLimit);

        if (
            !Number.isFinite(usedCount) ||
            usedCount < 0 ||
            !Number.isFinite(usageLimit) ||
            usageLimit < 1
        ) {
            return {
                isValid: false,
                message: 'Thông tin lượt sử dụng của voucher không hợp lệ.',
            };
        }

        if (usedCount >= usageLimit) {
            return {
                isValid: false,
                message: 'Voucher đã hết lượt sử dụng.',
            };
        }

        const minOrderValue = Number(voucher.minOrderValue);

        if (!Number.isFinite(minOrderValue) || minOrderValue < 0) {
            return {
                isValid: false,
                message: 'Thông tin giá trị đơn hàng tối thiểu không hợp lệ.',
            };
        }

        if (amount < minOrderValue) {
            return {
                isValid: false,
                message: `Đơn hàng chưa đạt giá trị tối thiểu ${minOrderValue.toLocaleString('vi-VN')} ₫ để sử dụng voucher.`,
            };
        }

        const discountPercent = Number(voucher.discountPercent);

        if (
            !Number.isFinite(discountPercent) ||
            discountPercent < 1 ||
            discountPercent > 100
        ) {
            return {
                isValid: false,
                message: 'Thông tin mức giảm giá của voucher không hợp lệ.',
            };
        }

        const discountAmount = Math.round(
            amount * discountPercent / 100
        );

        const finalAmount = Math.max(0, amount - discountAmount);

        return {
            isValid: true,
            message: 'Áp dụng voucher thành công.',
            voucher,
            discountPercent,
            discountAmount,
            finalAmount,
        };
    },

    create(voucherData) {
        const vouchers = this.getAll();

        const isDuplicate = vouchers.some(
            (voucher) =>
                voucher.code.toLowerCase() === voucherData.code.trim().toLowerCase()
        );

        if (isDuplicate) {
            throw new Error('Mã voucher đã tồn tại.');
        }

        const newVoucher = {
            id: `V${Date.now()}`,
            code: voucherData.code.trim().toUpperCase(),
            discountPercent: Number(voucherData.discountPercent),
            minOrderValue: Number(voucherData.minOrderValue),
            expiryDate: voucherData.expiryDate,
            usageLimit: Number(voucherData.usageLimit),
            usedCount: 0,
            isActive: voucherData.isActive ?? true,
        };

        const updatedVouchers = [...vouchers, newVoucher];
        const saved = storageService.set(
            STORAGE_KEYS.VOUCHERS,
            updatedVouchers
        );

        if (!saved) {
            throw new Error('Không thể lưu voucher.');
        }

        return newVoucher;
    },

    update(id, voucherData) {
        const vouchers = this.getAll();
        const existingVoucher = vouchers.find((voucher) => voucher.id === id);

        if (!existingVoucher) {
            throw new Error('Không tìm thấy voucher cần cập nhật.');
        }

        const isDuplicate = vouchers.some(
            (voucher) =>
                voucher.id !== id &&
                voucher.code.toLowerCase() === voucherData.code.trim().toLowerCase()
        );

        if (isDuplicate) {
            throw new Error('Mã voucher đã tồn tại.');
        }

        const updatedVoucher = {
            ...existingVoucher,
            ...voucherData,
            code: voucherData.code.trim().toUpperCase(),
            discountPercent: Number(voucherData.discountPercent),
            minOrderValue: Number(voucherData.minOrderValue),
            usageLimit: Number(voucherData.usageLimit),
        };

        const updatedVouchers = vouchers.map((voucher) =>
            voucher.id === id ? updatedVoucher : voucher
        );

        const saved = storageService.set(
            STORAGE_KEYS.VOUCHERS,
            updatedVouchers
        );

        if (!saved) {
            throw new Error('Không thể lưu thay đổi voucher.');
        }

        return updatedVoucher;
    },

    delete(id) {
        const vouchers = this.getAll();
        const exists = vouchers.some((voucher) => voucher.id === id);

        if (!exists) {
            throw new Error('Không tìm thấy voucher cần xóa.');
        }

        const updatedVouchers = vouchers.filter(
            (voucher) => voucher.id !== id
        );

        const saved = storageService.set(
            STORAGE_KEYS.VOUCHERS,
            updatedVouchers
        );

        if (!saved) {
            throw new Error('Không thể xóa voucher.');
        }

        return true;
    },
};