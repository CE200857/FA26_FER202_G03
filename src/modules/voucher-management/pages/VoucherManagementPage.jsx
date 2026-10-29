import { useEffect, useState } from 'react';
import { voucherService } from '../../../services/voucherService';
import VoucherForm from '../components/VoucherForm';
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
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [createError, setCreateError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const showVoucherForm = showCreateForm || Boolean(editingVoucher);

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

    const handleOpenCreateForm = () => {
        setEditingVoucher(null);
        setShowCreateForm(true);
        setCreateError('');
        setSuccessMessage('');
    };

    const handleOpenEditForm = (voucher) => {
        setEditingVoucher(voucher);
        setShowCreateForm(false);
        setCreateError('');
        setSuccessMessage('');
    };

    const handleCancelForm = () => {
        setShowCreateForm(false);
        setEditingVoucher(null);
        setCreateError('');
    };

    const handleSubmitVoucher = (voucherData) => {
        try {
            if (editingVoucher) {
                const updatedVoucher = voucherService.update(
                    editingVoucher.id,
                    voucherData
                );

                setVouchers(voucherService.getAll());
                setSuccessMessage(
                    `Cập nhật voucher ${updatedVoucher.code} thành công.`
                );
            } else {
                const newVoucher = voucherService.create(voucherData);

                setVouchers(voucherService.getAll());
                setSuccessMessage(
                    `Tạo voucher ${newVoucher.code} thành công.`
                );

                setSearchTerm('');
                setStatusFilter('all');
            }

            setShowCreateForm(false);
            setEditingVoucher(null);
            setCreateError('');
        } catch (submitError) {
            const action = editingVoucher ? 'cập nhật' : 'tạo';

            setCreateError(
                submitError instanceof Error
                    ? submitError.message
                    : `Không thể ${action} voucher.`
            );
            setSuccessMessage('');
        }
    };

    return (
        <section className="voucher-management">
            <div className="voucher-page-header">
                <div>
                    <h2>Quản lý voucher</h2>
                    <p>Quản lý mã giảm giá của cửa hàng.</p>
                </div>

                <button
                    type="button"
                    className="voucher-create-button"
                    onClick={
                        showVoucherForm
                            ? handleCancelForm
                            : handleOpenCreateForm
                    }
                >
                    {showVoucherForm ? 'Đóng biểu mẫu' : '+ Tạo voucher'}
                </button>
            </div>

            {successMessage && (
                <p className="voucher-success" role="status">
                    {successMessage}
                </p>
            )}

            {error && <p role="alert">{error}</p>}

            {showVoucherForm && (
                <VoucherForm
                    key={editingVoucher?.id ?? 'create'}
                    initialData={editingVoucher}
                    onSubmit={handleSubmitVoucher}
                    onCancel={handleCancelForm}
                    error={createError}
                    onClearError={() => setCreateError('')}
                />
            )}

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
                            <th>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredVouchers.map((voucher) => (
                            <tr key={voucher.id}>
                                <td>
                                    <strong>{voucher.code}</strong>
                                </td>

                                <td>{voucher.discountPercent}%</td>

                                <td>
                                    {formatCurrency(voucher.minOrderValue)}
                                </td>

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
                                        {voucher.isActive
                                            ? 'Đang hoạt động'
                                            : 'Đã tắt'}
                                    </span>
                                </td>

                                <td>
                                    <button
                                        type="button"
                                        className="voucher-edit-button"
                                        onClick={() =>
                                            handleOpenEditForm(voucher)
                                        }
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {filteredVouchers.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="voucher-empty"
                                >
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