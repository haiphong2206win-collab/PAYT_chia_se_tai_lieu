import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import './AdminLayout.css';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine current page title based on path
  const getPageTitle = (pathname) => {
    if (pathname.includes('/admin/users')) return 'User Management';
    if (pathname.includes('/admin/categories')) return 'Category Management';
    if (pathname.includes('/admin/reviews')) return 'Review Management';
    return 'Document Management';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main-area">
        <AdminHeader title={title} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
