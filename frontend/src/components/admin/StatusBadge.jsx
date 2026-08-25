import './Admin.css';

export const StatusBadge = ({ type = 'status', value }) => {
  if (!value) return null;
  const normalized = String(value).toLowerCase();

  let badgeClass = 'payt-status-badge';
  let label = value;

  switch (normalized) {
    // Document & User Statuses
    case 'pending':
      badgeClass += ' badge-warning';
      label = 'Chờ duyệt';
      break;
    case 'approved':
      badgeClass += ' badge-success';
      label = 'Đã duyệt';
      break;
    case 'rejected':
      badgeClass += ' badge-danger';
      label = 'Từ chối';
      break;
    case 'active':
      badgeClass += ' badge-success';
      label = 'Hoạt động';
      break;
    case 'locked':
      badgeClass += ' badge-danger';
      label = 'Đã khóa';
      break;

    // Roles
    case 'admin':
      badgeClass += ' badge-primary';
      label = 'Quản trị viên';
      break;
    case 'student':
      badgeClass += ' badge-neutral';
      label = 'Học sinh';
      break;

    default:
      badgeClass += ' badge-neutral';
      label = value;
      break;
  }

  return <span className={badgeClass}>{label}</span>;
};

export default StatusBadge;
