import './Select.css';

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  error,
  required = false,
  className = '',
  id
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`payt-select-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="payt-select-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className="payt-select-wrapper">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className="payt-select"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt, idx) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={idx} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <span className="payt-select-arrow">▾</span>
      </div>
      {error && <p className="payt-select-error">{error}</p>}
    </div>
  );
};

export default Select;
