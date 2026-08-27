import {
    Navigate,
} from 'react-router-dom';

// =====================================================
// ADMIN PROTECTED ROUTE
// =====================================================
//
// BE hiện tại:
//
// POST /auth/login
// → trả:
//
// {
//   user: {
//     role: "admin" | "student"
//   }
// }
//
// Nhưng:
//
// GET /users/profile
// → hiện CHƯA trả field role.
//
// Vì vậy ở thời điểm hiện tại:
//
// Login.jsx
// → lấy response.user.role
// → lưu:
//   sessionStorage.setItem('userRole', role)
//
// AdminProtectedRoute
// → đọc role từ sessionStorage
//
// Luồng:
//
// user truy cập /admin/*
//        ↓
// đọc sessionStorage.userRole
//        ↓
// không có role?
// → redirect /login
//
// role !== "admin"?
// → redirect /
//
// role === "admin"?
// → render Admin
//
// QUAN TRỌNG:
// Đây chỉ là protection phía Frontend.
//
// Bảo mật thật của:
// /admin/category
// /admin/documents
// /admin/users
// /admin/reviews
//
// vẫn PHẢI do Backend kiểm tra:
// JWT cookie + role admin.
//
// =====================================================

const AdminProtectedRoute = ({
    children,
}) => {
    // ===================================================
    // 1. LẤY ROLE ĐÃ LƯU SAU LOGIN
    // ===================================================

    const storedRole =
        sessionStorage.getItem('userRole');

    const role = String(
        storedRole || ''
    )
        .trim()
        .toLowerCase();

    // ===================================================
    // 2. KHÔNG CÓ ROLE
    // ===================================================
    //
    // Trường hợp thường gặp:
    // - chưa đăng nhập
    // - tab/browser session mới
    // - logout đã xóa userRole
    //
    // → đưa về Login.
    // ===================================================

    if (!role) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // ===================================================
    // 3. ĐÃ LOGIN NHƯNG KHÔNG PHẢI ADMIN
    // ===================================================
    //
    // Ví dụ:
    // userRole = "student"
    //
    // Student không được nhìn thấy Admin UI.
    // ===================================================

    if (role !== 'admin') {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    // ===================================================
    // 4. ADMIN
    // ===================================================
    //
    // userRole === "admin"
    // → cho phép render /admin/*
    // ===================================================

    return children;
};

export default AdminProtectedRoute;