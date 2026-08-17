import React from 'react';
import './Spinner.css';

export const Spinner = ({ size = 'md', color = 'var(--primary-orange)', className = '' }) => {
  return (
    <div className={`payt-spinner-wrap ${className}`}>
      <div
        className={`payt-spinner payt-spinner-${size}`}
        style={{ borderTopColor: color }}
      />
    </div>
  );
};

export default Spinner;
