import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';
import './Admin.css';

export const AdminConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận hành động',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này không? Thao tác này không thể hoàn tác.',
  confirmText = 'Xóa',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="admin-confirm-actions">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="admin-confirm-body">
        <div className={`admin-confirm-icon admin-confirm-icon-${variant}`}>
          <AlertTriangle size={24} />
        </div>
        <p className="admin-confirm-message">{message}</p>
      </div>
    </Modal>
  );
};

export default AdminConfirmModal;
