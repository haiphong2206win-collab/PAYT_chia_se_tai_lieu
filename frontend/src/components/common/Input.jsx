import React from 'react';
import './Input.css';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon = null,
  rightElement = null,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`payt-input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="payt-input-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className="payt-input-wrapper">
        {Icon && <Icon className="payt-input-icon-left" size={18} />}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`payt-input ${Icon ? 'has-left-icon' : ''} ${rightElement ? 'has-right-element' : ''}`}
          {...props}
        />
        {rightElement && <div className="payt-input-right-element">{rightElement}</div>}
      </div>
      {error && <p className="payt-input-error">{error}</p>}
      {!error && helperText && <p className="payt-input-helper">{helperText}</p>}
    </div>
  );
};

export default Input;
