import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Documents from '../pages/Admin/Documents';
import Users from '../pages/Admin/Users';
import Categories from '../pages/Admin/Categories';
import Reviews from '../pages/Admin/Reviews';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="documents" replace />} />
        <Route path="documents" element={<Documents />} />
        <Route path="users" element={<Users />} />
        <Route path="categories" element={<Categories />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="*" element={<Navigate to="documents" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
