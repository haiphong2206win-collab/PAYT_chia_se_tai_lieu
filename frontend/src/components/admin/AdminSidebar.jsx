import { NavLink, Link } from 'react-router-dom';
import {
  FileText,
  Users as UsersIcon,
  FolderTree,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  X
} from 'lucide-react';
import './Admin.css';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      label: 'Documents',
      path: '/admin/documents',
      icon: FileText
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: UsersIcon
    },
    {
      label: 'Categories',
      path: '/admin/categories',
      icon: FolderTree
    },
    {
      label: 'Reviews',
      path: '/admin/reviews',
      icon: MessageSquare
    }
  ];

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && <div className="admin-sidebar-overlay" onClick={onClose} />}

      <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin/documents" className="admin-brand-logo">
            <div className="admin-logo-badge">
              <ShieldCheck size={22} color="#FFFFFF" />
            </div>
            <div className="admin-logo-text">
              <span className="brand-name">PayT</span>
              <span className="brand-admin">Admin</span>
            </div>
          </Link>
          <button className="admin-sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <ul className="admin-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="admin-nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `admin-nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={18} className="admin-nav-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-back-btn" onClick={onClose}>
            <ArrowLeft size={18} />
            <span>Back to PayT</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
