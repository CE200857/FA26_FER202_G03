import { useEffect, useId, useRef } from 'react';
import '../product-management.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal: focus moves in on open and returns on close,
 * Tab stays inside the dialog, Escape closes it, page scroll is locked.
 * Props: title, onClose, initialFocusRef (optional), size ('md' | 'sm'), children.
 */
export default function Modal({ title, onClose, initialFocusRef, size = 'md', children }) {
  const titleId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Start on the first control in the body (not the "×" close button in the header).
    const target =
      initialFocusRef?.current ??
      dialogRef.current?.querySelector('.pm-modal__body')?.querySelector(FOCUSABLE) ??
      dialogRef.current?.querySelector(FOCUSABLE);
    target?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [initialFocusRef]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="pm-modal-backdrop">
      <div
        ref={dialogRef}
        className={`pm-modal pm-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
      >
        <header className="pm-modal__header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="pm-modal__close" aria-label="Đóng" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="pm-modal__body">{children}</div>
      </div>
    </div>
  );
}