import { STORAGE_KEYS, storageService } from './storageService';

export const voucherService = {
    getAll() {
        return storageService.get(STORAGE_KEYS.VOUCHERS, []);
    },

    getById(id) {
        return this.getAll().find((voucher) => voucher.id === id) || null;
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