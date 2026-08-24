import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export const Toast = ({
  message,
  type = 'success',
  onClose,
  duration = 3500
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={18} className="toast-icon toast-icon-error" />;
      case 'info':
        return <Info size={18} className="toast-icon toast-icon-info" />;
      default:
        return <CheckCircle2 size={18} className="toast-icon toast-icon-success" />;
    }
  };

  return (
    <div className={`payt-toast payt-toast-${type}`}>
      {getIcon()}
      <span className="toast-message">{message}</span>
      {onClose && (
        <button type="button" className="toast-close-btn" onClick={onClose} aria-label="Close notification">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Toast;
