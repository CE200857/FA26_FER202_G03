import { useEffect, useState } from 'react';
import { voucherService } from '../../../services/voucherService';
import './VoucherManagementPage.css';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);

const formatDate = (dateString) => {
    if (!dateString) return '—';

    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

const VoucherManagementPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            setVouchers(voucherService.getAll());
        } catch {
            setError('Không thể tải danh sách voucher.');
        }
    }, []);

    const filteredVouchers = vouchers.filter((voucher) => {
        const matchesSearch = voucher.code
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && voucher.isActive) ||
            (statusFilter === 'inactive' && !voucher.isActive);

        return matchesSearch && matchesStatus;
    });

    return (
        <section className="voucher-management">
            <div className="voucher-page-header">
                <div>
                    <h2>Quản lý voucher</h2>
                    <p>Quản lý mã giảm giá của cửa hàng.</p>
                </div>
            </div>

            <div className="voucher-toolbar">
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tìm theo mã voucher..."
                    aria-label="Tìm theo mã voucher"
                />

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Lọc trạng thái voucher"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang kích hoạt</option>
                    <option value="inactive">Đã tắt</option>
                </select>
            </div>

            {error && <p role="alert">{error}</p>}

            <div className="voucher-table-wrapper">
                <table className="voucher-table">
                    <thead>
                        <tr>
                            <th>Mã voucher</th>
                            <th>Mức giảm</th>
                            <th>Đơn tối thiểu</th>
                            <th>Hạn sử dụng</th>
                            <th>Lượt sử dụng</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredVouchers.map((voucher) => (
                            <tr key={voucher.id}>
                                <td>
                                    <strong>{voucher.code}</strong>
                                </td>
                                <td>{voucher.discountPercent}%</td>
                                <td>{formatCurrency(voucher.minOrderValue)}</td>
                                <td>{formatDate(voucher.expiryDate)}</td>
                                <td>
                                    {voucher.usedCount}/{voucher.usageLimit}
                                </td>
                                <td>
                                    <span
                                        className={
                                            voucher.isActive
                                                ? 'voucher-status voucher-status-active'
                                                : 'voucher-status voucher-status-inactive'
                                        }
                                    >
                                        {voucher.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {filteredVouchers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="voucher-empty">
                                    Không tìm thấy voucher phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="voucher-count">
                Hiển thị {filteredVouchers.length}/{vouchers.length} voucher
            </p>
        </section>
    );
};

export default VoucherManagementPage;