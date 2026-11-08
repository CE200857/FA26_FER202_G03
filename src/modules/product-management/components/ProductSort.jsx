import { useId } from 'react';
import { SORT_OPTIONS } from '../productQuery';
import '../product-management.css';

/** Props: value (one of SORT_OPTIONS values), onChange(newValue). */
export default function ProductSort({ value, onChange }) {
  const selectId = useId();

  return (
    <div className="pm-field">
      <label htmlFor={selectId}>Sắp xếp</label>
      <select id={selectId} value={value} onChange={(event) => onChange(event.target.value)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}