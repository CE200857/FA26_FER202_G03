import axios from 'axios';

const voucherApi = axios.create({
    baseURL: 'http://localhost:5001',
    timeout: 10000,
});

const VOUCHER_URL = '/vouchers';

// Lấy ngày hiện tại theo định dạng YYYY-MM-DD
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const voucherService = {
    // Lấy toàn bộ voucher
    async getAll() {
        try {
            const { data } = await voucherApi.get(VOUCHER_URL);

            if (!Array.isArray(data)) {
                throw new Error('Dữ liệu voucher không hợp lệ.');
            }

            return data;
        } catch (error) {
            console.error('Lỗi lấy danh sách voucher:', error);

            if (error.message === 'Dữ liệu voucher không hợp lệ.') {
                throw error;
            }

            throw new Error('Không thể tải danh sách voucher. Vui lòng thử lại!');
        }
    },

    // Lấy một voucher theo ID
    async getById(id) {
        try {
            const { data } = await voucherApi.get(
                `${VOUCHER_URL}/${encodeURIComponent(id)}`
            );

            return data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }

            console.error('Lỗi lấy thông tin voucher:', error);
            throw new Error('Không thể tải thông tin voucher. Vui lòng thử lại!');
        }
    },

    // Kiểm tra voucher và tính số tiền được giảm
    async validateVoucher(code, orderAmount) {
        const normalizedCode = String(code ?? '').trim().toUpperCase();

        if (!normalizedCode) {
            return { isValid: false, message: 'Vui lòng nhập mã voucher.' };
        }

        const amount = Number(orderAmount);

        if (
            orderAmount === null ||
            orderAmount === undefined ||
            orderAmount === '' ||
            !Number.isFinite(amount) ||
            amount < 0
        ) {
            return { isValid: false, message: 'Giá trị đơn hàng không hợp lệ.' };
        }

        const vouchers = await this.getAll();

        const voucher = vouchers.find(
            (item) =>
                String(item.code ?? '').trim().toUpperCase() === normalizedCode
        );

        if (!voucher) {
            return { isValid: false, message: 'Mã voucher không tồn tại.' };
        }

        if (voucher.isActive !== true) {
            return { isValid: false, message: 'Voucher hiện không được kích hoạt.' };
        }

        const today = getTodayDate();

        if (!voucher.expiryDate || voucher.expiryDate < today) {
            return { isValid: false, message: 'Voucher đã hết hạn sử dụng.' };
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
            return { isValid: false, message: 'Voucher đã hết lượt sử dụng.' };
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

    // Tạo voucher mới
    async create(voucherData) {
        const vouchers = await this.getAll();

        const normalizedCode = voucherData.code.trim().toUpperCase();

        const isDuplicate = vouchers.some(
            (voucher) =>
                String(voucher.code ?? '').trim().toUpperCase() === normalizedCode
        );

        if (isDuplicate) {
            throw new Error('Mã voucher đã tồn tại.');
        }

        const newVoucher = {
            id: `V${Date.now()}`,
            code: normalizedCode,
            discountPercent: Number(voucherData.discountPercent),
            minOrderValue: Number(voucherData.minOrderValue),
            expiryDate: voucherData.expiryDate,
            usageLimit: Number(voucherData.usageLimit),
            usedCount: 0,
            isActive: voucherData.isActive ?? true,
        };

        try {
            const { data } = await voucherApi.post(VOUCHER_URL, newVoucher);
            return data;
        } catch (error) {
            console.error('Lỗi tạo voucher:', error);
            throw new Error('Không thể tạo voucher. Vui lòng thử lại!');
        }
    },

    // Cập nhật voucher
    async update(id, voucherData) {
        const existingVoucher = await this.getById(id);

        if (!existingVoucher) {
            throw new Error('Không tìm thấy voucher cần cập nhật.');
        }

        const vouchers = await this.getAll();

        const normalizedCode = voucherData.code.trim().toUpperCase();

        const isDuplicate = vouchers.some(
            (voucher) =>
                String(voucher.id) !== String(id) &&
                String(voucher.code ?? '').trim().toUpperCase() === normalizedCode
        );

        if (isDuplicate) {
            throw new Error('Mã voucher đã tồn tại.');
        }

        const updatedVoucher = {
            ...existingVoucher,
            ...voucherData,
            code: normalizedCode,
            discountPercent: Number(voucherData.discountPercent),
            minOrderValue: Number(voucherData.minOrderValue),
            usageLimit: Number(voucherData.usageLimit),
        };

        try {
            const { data } = await voucherApi.patch(
                `${VOUCHER_URL}/${encodeURIComponent(id)}`,
                updatedVoucher
            );

            return data;
        } catch (error) {
            console.error('Lỗi cập nhật voucher:', error);
            throw new Error('Không thể lưu thay đổi voucher. Vui lòng thử lại!');
        }
    },

    // Xóa voucher
    async delete(id) {
        const existingVoucher = await this.getById(id);

        if (!existingVoucher) {
            throw new Error('Không tìm thấy voucher cần xóa.');
        }

        try {
            await voucherApi.delete(
                `${VOUCHER_URL}/${encodeURIComponent(id)}`
            );

            return true;
        } catch (error) {
            console.error('Lỗi xóa voucher:', error);
            throw new Error('Không thể xóa voucher. Vui lòng thử lại!');
        }
    },
};