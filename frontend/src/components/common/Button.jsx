import Spinner from './Spinner';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  icon: Icon = null,
  className = ''
}) => {
  return (
    <button
      type={type}
      className={`payt-btn payt-btn-${variant} payt-btn-${size} ${fullWidth ? 'payt-btn-full' : ''} ${loading ? 'is-loading' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <Spinner size="sm" color={variant === 'primary' || variant === 'danger' ? '#ffffff' : 'var(--primary-orange)'} />
      ) : (
        Icon && <Icon className="payt-btn-icon" size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
