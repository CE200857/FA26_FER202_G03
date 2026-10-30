import { storageService } from './storageService';
import { voucherService } from './voucherService';

const CLAIMS_KEY = 'spa_voucher_claims';

export const voucherClaimService = {
  getAll() {
    return storageService.get(CLAIMS_KEY, []);
  },

  getByUser(userId) {
    return this.getAll().filter(
      (claim) => claim.userId === userId
    );
  },

  hasClaimed(userId, voucherId) {
    return this.getAll().some(
      (claim) =>
        claim.userId === userId &&
        claim.voucherId === voucherId
    );
  },

  claim(userId, voucherId) {
    if (!userId) {
      throw new Error('Vui lòng đăng nhập để nhận voucher.');
    }

    const voucher = voucherService.getById(voucherId);

    if (!voucher) {
      throw new Error('Không tìm thấy voucher.');
    }

    if (!voucher.isActive) {
      throw new Error('Voucher hiện không hoạt động.');
    }

    if (voucher.expiryDate < this.getTodayDate()) {
      throw new Error('Voucher đã hết hạn.');
    }

    if (
      Number(voucher.usedCount) >=
      Number(voucher.usageLimit)
    ) {
      throw new Error('Voucher đã hết lượt sử dụng.');
    }

    if (this.hasClaimed(userId, voucherId)) {
      throw new Error('Bạn đã nhận voucher này rồi.');
    }

    const newClaim = {
      id: `VC${Date.now()}`,
      userId,
      voucherId,
      claimedAt: new Date().toISOString(),
    };

    const claims = this.getAll();

    const saved = storageService.set(
      CLAIMS_KEY,
      [...claims, newClaim]
    );

    if (!saved) {
      throw new Error('Không thể lưu voucher.');
    }

    return newClaim;
  },

  getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  },
};