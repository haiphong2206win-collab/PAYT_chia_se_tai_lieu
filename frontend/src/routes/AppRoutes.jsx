import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import Home from '../pages/Home';
import DocumentList from '../pages/Document/DocumentList';
import DocumentDetail from '../pages/Document/DocumentDetail';
import UploadDocument from '../pages/Document/UploadDocument';
import Profile from '../pages/Profile';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Layout Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Main Layout Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/documents" element={<DocumentList />} />
        <Route path="/documents/:id" element={<DocumentDetail />} />
        <Route path="/upload" element={<UploadDocument />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Catch-all Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
