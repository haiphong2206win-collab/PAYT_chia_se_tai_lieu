import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import './Modal.css';

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer = null,
  size = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="payt-modal-overlay" onClick={onClose}>
      <div className={`payt-modal-content payt-modal-${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="payt-modal-header">
          <h3 className="payt-modal-title">{title}</h3>
          <button className="payt-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="payt-modal-body">{children}</div>
        {footer && <div className="payt-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
