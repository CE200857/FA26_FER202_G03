import { useId, useRef, useState } from 'react';
import Modal from './Modal';
import { LIMITS, validateProduct } from '../productValidation';

const EMPTY_VALUES = { name: '', brand: '', category: '', price: '', stock: '0', image: '', description: '' };

function toFormValues(product) {
  if (!product) return EMPTY_VALUES;
  return {
    name: product.name ?? '',
    brand: product.brand ?? '',
    category: product.category ?? '',
    price: String(product.price ?? ''),
    stock: String(product.stock ?? 0),
    image: product.image ?? '',
    description: product.description ?? '',
  };
}

function Field({ id, label, required = false, error, hint, children }) {
  return (
    <div className="pm-form__field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="pm-form__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="pm-form__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Add / edit form shown in a modal.
 * Props: product (null = create), categories (suggestions), onSubmit(values) (async, may throw), onClose.
 */
export default function ProductFormModal({ product = null, categories = [], onSubmit, onClose }) {
  const uid = useId();
  const formRef = useRef(null);
  const [values, setValues] = useState(() => toFormValues(product));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(product);
  const idOf = (name) => `${uid}-${name}`;

  const inputProps = (name) => ({
    id: idOf(name),
    name,
    value: values[name],
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${idOf(name)}-error` : undefined,
    onChange: (event) => {
      setValues((previous) => ({ ...previous, [name]: event.target.value }));
      if (errors[name]) setErrors((previous) => ({ ...previous, [name]: undefined }));
    },
  });

  const focusFirstInvalid = () => {
    // Wait for React to paint the error state, then focus the first invalid field.
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const found = validateProduct(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setSubmitError('');
      focusFirstInvalid();
      return;
    }

    setSaving(true);
    setSubmitError('');
    try {
      await onSubmit(values); // the parent closes the modal on success
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
        focusFirstInvalid();
      } else {
        setSubmitError(error.message || 'Không thể lưu sản phẩm. Vui lòng thử lại.');
      }
      setSaving(false);
    }
  };

  const listId = `${uid}-categories`;

  return (
    <Modal title={isEdit ? `Sửa sản phẩm ${product.id}` : 'Thêm sản phẩm'} onClose={saving ? () => {} : onClose}>
      <form ref={formRef} className="pm-form" onSubmit={handleSubmit} noValidate>
        <Field id={idOf('name')} label="Tên sản phẩm" required error={errors.name}>
          <input {...inputProps('name')} type="text" maxLength={LIMITS.name + 20} aria-required="true" />
        </Field>

        <div className="pm-form__row">
          <Field id={idOf('brand')} label="Thương hiệu" required error={errors.brand}>
            <input {...inputProps('brand')} type="text" aria-required="true" />
          </Field>
          <Field
            id={idOf('category')}
            label="Danh mục"
            required
            error={errors.category}
            hint="Chọn danh mục có sẵn hoặc gõ danh mục mới."
          >
            <input {...inputProps('category')} type="text" list={listId} aria-required="true" />
            <datalist id={listId}>
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>
        </div>

        <div className="pm-form__row">
          <Field id={idOf('price')} label="Giá bán (₫)" required error={errors.price}>
            <input {...inputProps('price')} type="number" inputMode="numeric" min="1" step="1000" aria-required="true" />
          </Field>
          <Field id={idOf('stock')} label="Tồn kho" required error={errors.stock}>
            <input {...inputProps('stock')} type="number" inputMode="numeric" min="0" step="1" aria-required="true" />
          </Field>
        </div>

        <Field
          id={idOf('image')}
          label="Link ảnh"
          error={errors.image}
          hint="Không bắt buộc. Nếu để trống, thẻ sản phẩm sẽ hiện chữ cái đầu của tên."
        >
          <input {...inputProps('image')} type="text" inputMode="url" placeholder="https://..." />
        </Field>

        <Field id={idOf('description')} label="Mô tả" error={errors.description}>
          <textarea {...inputProps('description')} rows={4} />
        </Field>

        {submitError && (
          <p className="pm-form__error" role="alert">
            {submitError}
          </p>
        )}

        <div className="pm-modal__actions">
          <button type="button" className="pm-btn pm-btn--ghost" disabled={saving} onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="pm-btn pm-btn--inline" disabled={saving}>
            {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </button>
        </div>
      </form>
    </Modal>
  );
}