import axios from 'axios';
import { voucherService } from './voucherService';

const claimApi = axios.create({
    baseURL: 'http://localhost:5001',
    timeout: 10000,
});

const CLAIM_URL = '/voucherClaims';

export const voucherClaimService = {
    // Lấy toàn bộ lượt nhận voucher
    async getAll() {
        try {
            const { data } = await claimApi.get(CLAIM_URL);

            if (!Array.isArray(data)) {
                throw new Error('Dữ liệu voucher đã nhận không hợp lệ.');
            }

            return data;
        } catch (error) {
            console.error('Lỗi lấy danh sách voucher đã nhận:', error);

            if (error.message === 'Dữ liệu voucher đã nhận không hợp lệ.') {
                throw error;
            }

            throw new Error('Không thể tải danh sách voucher đã nhận.');
        }
    },

    // Lấy voucher đã nhận của một người dùng
    async getByUser(userId) {
        if (!userId) return [];

        try {
            const { data } = await claimApi.get(CLAIM_URL, {
                params: { userId },
            });

            if (!Array.isArray(data)) {
                throw new Error('Dữ liệu voucher đã nhận không hợp lệ.');
            }

            return data;
        } catch (error) {
            console.error('Lỗi lấy voucher theo người dùng:', error);

            if (error.message === 'Dữ liệu voucher đã nhận không hợp lệ.') {
                throw error;
            }

            throw new Error('Không thể tải voucher đã nhận.');
        }
    },

    // Kiểm tra người dùng đã nhận voucher chưa
    async hasClaimed(userId, voucherId) {
        const claims = await this.getByUser(userId);

        return claims.some(
            (claim) => String(claim.voucherId) === String(voucherId)
        );
    },

    // Nhận voucher
    async claim(userId, voucherId) {
        if (!userId) {
            throw new Error('Vui lòng đăng nhập để nhận voucher.');
        }

        const voucher = await voucherService.getById(voucherId);

        if (!voucher) {
            throw new Error('Không tìm thấy voucher.');
        }

        if (!voucher.isActive) {
            throw new Error('Voucher hiện không hoạt động.');
        }

        if (!voucher.expiryDate || voucher.expiryDate < this.getTodayDate()) {
            throw new Error('Voucher đã hết hạn.');
        }

        if (
            Number(voucher.usedCount) >=
            Number(voucher.usageLimit)
        ) {
            throw new Error('Voucher đã hết lượt sử dụng.');
        }

        const alreadyClaimed = await this.hasClaimed(userId, voucherId);

        if (alreadyClaimed) {
            throw new Error('Bạn đã nhận voucher này rồi.');
        }

        const newClaim = {
            id: `VC${Date.now()}`,
            userId,
            voucherId,
            claimedAt: new Date().toISOString(),
        };

        try {
            const { data } = await claimApi.post(CLAIM_URL, newClaim);
            return data;
        } catch (error) {
            console.error('Lỗi nhận voucher:', error);
            throw new Error('Không thể lưu voucher. Vui lòng thử lại.');
        }
    },

    // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
    getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    },
};