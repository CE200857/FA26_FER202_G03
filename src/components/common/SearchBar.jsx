import { useId } from 'react';
import './SearchBar.css';

/**
 * Generic controlled search box.
 * Props: value, onChange(newValue), label (read by screen readers), placeholder.
 */
export default function SearchBar({ value, onChange, label = 'Tìm kiếm', placeholder = 'Tìm kiếm...' }) {
  const inputId = useId();

  return (
    <div className="search-bar" role="search">
      <label htmlFor={inputId} className="search-bar__label">
        {label}
      </label>
      <input
        id={inputId}
        type="search"
        className="search-bar__input"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          aria-label="Xóa nội dung tìm kiếm"
          onClick={() => onChange('')}
        >
          ×
        </button>
      )}
    </div>
  );
}