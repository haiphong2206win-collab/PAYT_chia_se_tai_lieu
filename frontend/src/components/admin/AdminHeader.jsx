import { Menu, Bell } from 'lucide-react';
import './Admin.css';

export const AdminHeader = ({ title, onToggleSidebar }) => {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          className="admin-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="admin-page-title">{title}</h1>
      </div>

      <div className="admin-header-right">
        <button className="admin-header-icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>
        <div className="admin-user-profile">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack"
            alt="Admin Avatar"
            className="admin-avatar"
          />
          <div className="admin-user-info">
            <span className="admin-user-name">Admin User</span>
            <span className="admin-user-role">System Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
