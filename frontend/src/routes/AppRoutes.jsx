import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import AdminRoutes from './AdminRoutes';

// PROTECTED ROUTES

import ProtectedRoute from '../components/common/ProtectedRoute';

import AdminProtectedRoute from '../components/common/AdminProtectedRoute';

// PAGES

import Home from '../pages/Home';
import DocumentList from '../pages/Document/DocumentList';
import DocumentDetail from '../pages/Document/DocumentDetail';
import UploadDocument from '../pages/Document/UploadDocument';
import Profile from '../pages/Profile';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

// APP ROUTES

export const AppRoutes = () => {
  return (
    <Routes>

      {/* =================================================
          ADMIN ROUTES

          /admin/* chỉ cho phép:
          - user đã đăng nhập
          - role === "admin"

          Nếu chưa login:
          → AdminProtectedRoute redirect /login

          Nếu đã login nhưng không phải admin:
          → AdminProtectedRoute redirect /
      ================================================= */}

      <Route
        path="/admin/*"
        element={
          <AdminProtectedRoute>

            <AdminRoutes />

          </AdminProtectedRoute>
        }
      />

      {/* =================================================
          AUTH ROUTES
      ================================================= */}

      <Route
        element={
          <AuthLayout />
        }
      >

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/register"
          element={
            <Register />
          }
        />

      </Route>

      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <Route
        element={
          <MainLayout />
        }
      >

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/"
          element={
            <Home />
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <DocumentDetail />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROTECTED ROUTE: UPLOAD

            Chỉ cần login.
            Không yêu cầu role admin.
        ================================================= */}

        <Route
          path="/upload"
          element={
            <ProtectedRoute>

              <UploadDocument />

            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROTECTED ROUTE: PROFILE

            Chỉ cần login.
            Không yêu cầu role admin.
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>
          }
        />

      </Route>

      {/* =================================================
          FALLBACK ROUTE

          Route không tồn tại
          → quay về Home.
      ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
};

export default AppRoutes;