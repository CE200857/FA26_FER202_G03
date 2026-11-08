import { useRef } from 'react';
import Modal from './Modal';

/**
 * Props: title, message, confirmLabel, busyLabel, busy, error, onConfirm, onCancel.
 * Focus starts on "Hủy" so a stray Enter never confirms a destructive action.
 */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Xác nhận',
  busyLabel = 'Đang xử lý...',
  busy = false,
  error = '',
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  return (
    <Modal title={title} size="sm" initialFocusRef={cancelRef} onClose={busy ? () => {} : onCancel}>
      <p className="pm-modal__message">{message}</p>
      {error && (
        <p className="pm-form__error" role="alert">
          {error}
        </p>
      )}
      <div className="pm-modal__actions">
        <button ref={cancelRef} type="button" className="pm-btn pm-btn--ghost" disabled={busy} onClick={onCancel}>
          Hủy
        </button>
        <button type="button" className="pm-btn pm-btn--danger pm-btn--inline" disabled={busy} onClick={onConfirm}>
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}